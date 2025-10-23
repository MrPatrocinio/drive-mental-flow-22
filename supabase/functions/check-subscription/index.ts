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
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Use the service role key to perform writes (upsert) in Supabase
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY não configurada");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Usuário não autenticado");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Erro de autenticação: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("Usuário não autenticado ou email indisponível");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, updating unsubscribed state");
      await supabaseClient.from("subscribers").upsert({
        email: user.email,
        user_id: user.id,
        stripe_customer_id: null,
        subscription_status: 'none', // 🔥 FASE 2
        subscription_tier: null,
        subscription_end: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });
      return new Response(JSON.stringify({ 
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
        subscription_status: 'none' // 🔥 FASE 2
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // 🔥 FASE 2: Buscar todas as subscriptions (não só 'active')
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
    });
    
    const hasSubscription = subscriptions.data.length > 0;
    let subscriptionTier = null;
    let subscriptionEnd = null;
    let subscriptionStatus = 'none'; // 🔥 FASE 2: Status padrão
    let subscriptionId = null;

    if (hasSubscription) {
      const subscription = subscriptions.data[0];
      subscriptionId = subscription.id;
      subscriptionStatus = subscription.status; // 🔥 FASE 2: Status do Stripe
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      
      logStep("Subscription found", { 
        subscriptionId, 
        status: subscriptionStatus, 
        endDate: subscriptionEnd 
      });
      
      // Determine subscription tier from price
      const priceId = subscription.items.data[0].price.id;
      const price = await stripe.prices.retrieve(priceId);
      const amount = price.unit_amount || 0;
      
      if (amount <= 3000) {
        subscriptionTier = "basic";
      } else if (amount <= 10000) {
        subscriptionTier = "premium";
      } else {
        subscriptionTier = "enterprise";
      }
      logStep("Determined subscription tier", { priceId, amount, subscriptionTier });
    } else {
      logStep("No subscription found");
    }

    // 🔥 FASE 2: Determinar se está ativo (backward compatibility)
    const isActive = subscriptionStatus === 'active' || subscriptionStatus === 'trialing';

    await supabaseClient.from("subscribers").upsert({
      email: user.email,
      user_id: user.id,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId, // 🔥 FASE 1
      subscription_status: subscriptionStatus, // 🔥 FASE 2
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'email' });

    logStep("Updated database with subscription info", { 
      subscriptionStatus, 
      isActive, 
      subscriptionTier 
    });
    
    return new Response(JSON.stringify({
      subscribed: isActive, // Backward compatibility
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      subscription_status: subscriptionStatus // 🔥 FASE 2
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});