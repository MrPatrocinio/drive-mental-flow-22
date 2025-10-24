import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[VERIFY-SESSION] Function started");

    const { sessionId } = await req.json();
    
    if (!sessionId) {
      throw new Error("Session ID é obrigatório");
    }

    console.log("[VERIFY-SESSION] Verifying session:", sessionId);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer']
    });
    
    console.log("[VERIFY-SESSION] Session status:", session.payment_status);
    console.log("[VERIFY-SESSION] Customer email:", session.customer_details?.email);

    const sessionData = {
      sessionId: session.id,
      paid: session.payment_status === 'paid',
      email: session.customer_details?.email || '',
      customerId: typeof session.customer === 'string' ? session.customer : session.customer?.id || '',
      subscriptionId: typeof session.subscription === 'string' ? session.subscription : session.subscription?.id || '',
      status: session.status
    };

    return new Response(JSON.stringify(sessionData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[VERIFY-SESSION] Error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Erro interno do servidor" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
