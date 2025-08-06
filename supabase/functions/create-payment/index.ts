
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    console.log("[CREATE-PAYMENT] Function started");

    // Get user data from request body (for guest checkout)
    const { email, name } = await req.json();
    console.log("[CREATE-PAYMENT] Payment request for:", { email, name });

    if (!email) {
      throw new Error("Email é obrigatório");
    }

    // Get current pricing from Supabase
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: pricingData, error: pricingError } = await supabaseService
      .from('landing_content')
      .select('content')
      .eq('section', 'pricing')
      .single();

    let finalPrice = 9700; // Default R$ 97,00 em centavos
    let productName = "Drive Mental - Acesso Vitalício";

    if (pricingData?.content && !pricingError) {
      const pricing = pricingData.content as any;
      
      // Check for active promotion
      if (pricing.has_promotion && pricing.promotion_end_date && new Date(pricing.promotion_end_date) > new Date()) {
        // Use discounted price
        const originalPrice = pricing.original_price || pricing.price;
        const discountPercentage = pricing.discount_percentage || 0;
        const discountedPrice = originalPrice - (originalPrice * discountPercentage / 100);
        finalPrice = Math.round(discountedPrice * 100); // Convert to centavos
        
        if (pricing.promotion_label) {
          productName = `${productName} - ${pricing.promotion_label}`;
        }
      } else {
        // Use regular price
        finalPrice = Math.round(pricing.price * 100); // Convert to centavos
      }
    }

    console.log("[CREATE-PAYMENT] Using price:", finalPrice / 100, "BRL");

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY não configurada");
    }
    
    console.log("[CREATE-PAYMENT] Stripe key found, initializing...");
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    // Create a one-time payment session with dynamic pricing
    console.log("[CREATE-PAYMENT] Creating checkout session...");
    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      customer_creation: "always",
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: { 
              name: productName,
              description: "Acesso completo a todos os áudios e recursos do Drive Mental"
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
        customer_email: email,
        customer_name: name || "",
        final_price: finalPrice.toString(),
      },
    });

    console.log("[CREATE-PAYMENT] Checkout session created successfully:", session.id);

    return new Response(JSON.stringify({ 
      url: session.url,
      sessionId: session.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[CREATE-PAYMENT] Error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Erro interno do servidor" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
