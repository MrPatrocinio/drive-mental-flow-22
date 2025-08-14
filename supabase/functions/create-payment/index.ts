
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
  console.log(`[CREATE-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    // Get user data from request body (for guest checkout)
    const { email, name } = await req.json();
    logStep("Payment request received", { email, hasName: !!name });

    // Enhanced input validation
    if (!email || typeof email !== 'string' || !email.trim()) {
      throw new Error("Email é obrigatório e deve ser uma string válida");
    }

    if (!name || typeof name !== 'string' || !name.trim()) {
      throw new Error("Nome é obrigatório e deve ser uma string válida");
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      throw new Error("Email deve ter um formato válido");
    }

    if (name.trim().length < 2) {
      throw new Error("Nome deve ter pelo menos 2 caracteres");
    }

    // Get current pricing from Supabase with sync validation
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

    let finalPrice = 12700; // Default R$ 127,00 em centavos (valor anual padrão)
    let productName = "Drive Mental - Acesso Anual";

    if (pricingData?.content && !pricingError) {
      const pricing = pricingData.content as any;
      logStep("Using synchronized pricing from database", { 
        hasPromotion: pricing.has_promotion,
        originalPrice: pricing.price
      });
      
      // Apply pricing sync logic - check for active promotion
      if (pricing.has_promotion && pricing.promotion_end_date && new Date(pricing.promotion_end_date) > new Date()) {
        // Use discounted price
        const originalPrice = pricing.original_price || pricing.price;
        const discountPercentage = pricing.discount_percentage || 0;
        const discountedPrice = originalPrice - (originalPrice * discountPercentage / 100);
        finalPrice = Math.round(discountedPrice * 100); // Convert to centavos
        
        if (pricing.promotion_label) {
          productName = `${productName} - ${pricing.promotion_label}`;
        }
        logStep("Applied synchronized promotional pricing", { 
          originalPrice, 
          discountPercentage, 
          finalPrice: finalPrice / 100,
          promotionLabel: pricing.promotion_label 
        });
      } else {
        // Use regular price - convert to annual if needed
        let regularPrice = pricing.price;
        
        // If price seems monthly (< R$ 50), convert to annual
        if (regularPrice < 50) {
          regularPrice = regularPrice * 12;
          logStep("Converted monthly price to annual", { 
            monthlyPrice: pricing.price, 
            annualPrice: regularPrice 
          });
        }
        
        finalPrice = Math.round(regularPrice * 100); // Convert to centavos
        logStep("Using synchronized regular pricing", { finalPrice: finalPrice / 100 });
      }
    } else {
      logStep("Using default annual pricing (database unavailable)", { finalPrice: finalPrice / 100 });
    }

    // Validate final price for annual subscription
    if (finalPrice < 1000) { // Minimum R$ 10,00 annual
      logStep("Price too low, adjusting to minimum annual", { 
        originalPrice: finalPrice / 100, 
        adjustedPrice: 127 
      });
      finalPrice = 12700; // R$ 127,00 default annual
    }

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY não configurada");
    }
    
    // Validate Stripe key format
    if (!stripeKey.startsWith('sk_')) {
      throw new Error("STRIPE_SECRET_KEY tem formato inválido");
    }

    const isTestKey = stripeKey.startsWith('sk_test_');
    logStep("Stripe configuration", { isTestMode: isTestKey, keyPrefix: stripeKey.substring(0, 8) + "..." });
    
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    // Enhanced error handling for price validation
    if (finalPrice < 50) { // Minimum 50 centavos
      throw new Error("Preço inválido: valor muito baixo");
    }

    if (finalPrice > 1000000) { // Maximum R$ 10,000
      throw new Error("Preço inválido: valor muito alto");
    }

    // Create a one-time payment session with enhanced configuration
    logStep("Creating Stripe checkout session", { finalPrice: finalPrice / 100, productName });
    const session = await stripe.checkout.sessions.create({
      customer_email: email.trim(),
      customer_creation: "always",
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: { 
              name: productName,
              description: "Acesso completo a todos os áudios e recursos do Drive Mental por 1 ano"
            },
            unit_amount: finalPrice,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/pagamento/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/pagamento/cancelado`,
      metadata: {
        customer_email: email.trim(),
        customer_name: name.trim(),
        final_price: finalPrice.toString(),
        environment: isTestKey ? "test" : "production",
        created_at: new Date().toISOString(),
        pricing_synced: "true", // Mark as using synchronized pricing
      },
      // Enhanced session configuration
      expires_at: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
      billing_address_collection: "auto",
      phone_number_collection: {
        enabled: false,
      },
    });

    logStep("Checkout session created successfully", { 
      sessionId: session.id, 
      url: session.url,
      expiresAt: new Date(session.expires_at * 1000).toISOString(),
      syncedPricing: true
    });

    return new Response(JSON.stringify({ 
      url: session.url,
      sessionId: session.id,
      expiresAt: session.expires_at,
      syncedPrice: finalPrice / 100 // Return synced price for verification
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro interno do servidor";
    logStep("ERROR in create-payment", { 
      message: errorMessage,
      type: error instanceof Error ? error.constructor.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Return user-friendly error messages
    const friendlyErrors: Record<string, string> = {
      "Email é obrigatório": "Por favor, insira um email válido",
      "Nome é obrigatório": "Por favor, insira seu nome completo",
      "STRIPE_SECRET_KEY não configurada": "Erro de configuração do sistema de pagamento",
      "STRIPE_SECRET_KEY tem formato inválido": "Erro de configuração do sistema de pagamento"
    };

    const responseMessage = friendlyErrors[errorMessage] || "Erro no processamento do pagamento";
    
    return new Response(JSON.stringify({ 
      error: responseMessage,
      code: error instanceof Error ? error.constructor.name : 'UnknownError'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
