
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY não configurada");
    }
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Usuário não autenticado");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Erro de autenticação: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("Usuário não autenticado ou email indisponível");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Check for existing customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      logStep("No existing customer found, will create one during checkout");
    }

    // Get synchronized pricing from Supabase
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    logStep("Fetching synchronized pricing data from database");
    const { data: pricingData, error: pricingError } = await supabaseService
      .from('landing_content')
      .select('content')
      .eq('section', 'pricing')
      .single();

    // Default annual pricing: R$ 127,00 (12.700 centavos)
    let annualPrice = {
      amount: 12700, // R$ 127,00 em centavos
      name: "Drive Mental - Assinatura Anual"
    };

    if (pricingData?.content && !pricingError) {
      const pricing = pricingData.content as any;
      logStep("Using synchronized pricing from database", { 
        hasPromotion: pricing.has_promotion,
        originalPrice: pricing.price
      });
      
      // Apply pricing sync logic
      if (pricing.has_promotion && pricing.promotion_end_date && new Date(pricing.promotion_end_date) > new Date()) {
        // Use promotional price for annual subscription
        const originalPrice = pricing.original_price || pricing.price;
        const discountPercentage = pricing.discount_percentage || 0;
        let discountedPrice = originalPrice - (originalPrice * discountPercentage / 100);
        
        // If discounted price seems monthly, convert to annual
        if (discountedPrice < 50) {
          discountedPrice = discountedPrice * 12;
        }
        
        annualPrice.amount = Math.round(discountedPrice * 100);
        
        if (pricing.promotion_label) {
          annualPrice.name = `${annualPrice.name} - ${pricing.promotion_label}`;
        }
        
        logStep("Applied synchronized promotional pricing", { 
          originalPrice, 
          discountPercentage, 
          finalPrice: annualPrice.amount / 100,
          promotionLabel: pricing.promotion_label
        });
      } else {
        // Use regular price, ensure it's annual
        let regularPrice = pricing.price;
        
        // If price seems monthly (< R$ 50), convert to annual
        if (regularPrice < 50) {
          regularPrice = regularPrice * 12;
          logStep("Converted monthly price to annual", { 
            monthlyPrice: pricing.price, 
            annualPrice: regularPrice 
          });
        }
        
        annualPrice.amount = Math.round(regularPrice * 100);
        logStep("Using synchronized regular pricing", { finalPrice: annualPrice.amount / 100 });
      }
    } else {
      logStep("Using default annual pricing (database unavailable)", { finalPrice: annualPrice.amount / 100 });
    }

    // Validate annual price
    if (annualPrice.amount < 1000) { // Minimum R$ 10,00 annual
      logStep("Price too low for annual subscription, using default", { 
        providedPrice: annualPrice.amount / 100,
        defaultPrice: 127
      });
      annualPrice.amount = 12700; // Default R$ 127,00
    }
    
    logStep("Final annual pricing set", { pricing: annualPrice });

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      customer_creation: customerId ? undefined : "always",
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: { 
              name: annualPrice.name,
              description: "Acesso completo ao Drive Mental por 1 ano"
            },
            unit_amount: annualPrice.amount,
            recurring: { interval: "year" }, // Always annual subscription
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/pagamento/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/pagamento/cancelado`,
      metadata: {
        user_id: user.id,
        user_email: user.email,
        subscription_type: "annual",
        pricing_synced: "true", // Mark as using synchronized pricing
        final_amount: annualPrice.amount.toString(),
      },
    });

    logStep("Checkout session created successfully", { 
      sessionId: session.id, 
      url: session.url,
      syncedPricing: true,
      annualAmount: annualPrice.amount / 100
    });

    return new Response(JSON.stringify({ 
      url: session.url,
      sessionId: session.id,
      syncedPrice: annualPrice.amount / 100 // Return synced price for verification
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
