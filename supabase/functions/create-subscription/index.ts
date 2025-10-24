import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Mapeamento de planCode para Stripe Price ID
const PLAN_PRICE_MAPPING: Record<string, string> = {
  'quarterly': 'price_1RBwMOBs9EqB2tIL0pRIU93B',
  'semiannual': 'price_1RBwN2Bs9EqB2tILgwCt6l6K',
  'annual': 'price_1RBwNcBs9EqB2tILcihN3JI7'
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY não configurada");
    }
    logStep("Stripe key verified");

    const { planCode } = await req.json();
    logStep("Plan code requested", { planCode });

    if (!planCode) {
      throw new Error("planCode é obrigatório");
    }

    // Inicializar Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase não configurado");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar dados dos planos no Supabase
    const { data: landingContent, error: supabaseError } = await supabase
      .from('landing_content')
      .select('content')
      .eq('section', 'subscription_plans')
      .single();

    if (supabaseError || !landingContent) {
      logStep("ERROR fetching plans from Supabase", { error: supabaseError });
      throw new Error("Erro ao buscar planos de assinatura");
    }

    const plansData = landingContent.content as any;
    const selectedPlan = plansData.plans.find((p: any) => p.id === planCode);

    if (!selectedPlan) {
      throw new Error(`Plano ${planCode} não encontrado`);
    }

    if (!selectedPlan.is_active) {
      throw new Error(`Plano ${planCode} não está ativo`);
    }

    // Mapear planCode para priceId do Stripe
    const priceId = PLAN_PRICE_MAPPING[planCode];
    if (!priceId) {
      throw new Error(`Price ID não configurado para o plano ${planCode}`);
    }

    logStep("Price ID mapped", { planCode, priceId });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Criar checkout session SEM exigir autenticação
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${req.headers.get("origin")}/assinatura/processando?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/assinatura?canceled=true`,
      client_reference_id: crypto.randomUUID(),
      billing_address_collection: "required",
      phone_number_collection: {
        enabled: false,
      },
      metadata: {
        plan_code: planCode,
        plan_name: selectedPlan.name
      }
    });

    logStep("Checkout session created successfully", { 
      sessionId: session.id, 
      url: session.url,
      planCode,
      priceId
    });

    return new Response(JSON.stringify({ 
      url: session.url,
      sessionId: session.id 
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
