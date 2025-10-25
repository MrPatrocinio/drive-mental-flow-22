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
  'quarterly': 'price_1SGAwC4J5tUHBhq6jylL5ZCz',
  'semiannual': 'price_1SGAxS4J5tUHBhq6cK6qFdgy',
  'annual': 'price_1SGAyB4J5tUHBhq6eHSyaZeQ'
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // 🔒 VALIDAÇÃO JWT - Primeira camada de segurança (Fail-Fast)
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      logStep("ERROR: Missing Authorization header");
      return new Response(JSON.stringify({ 
        error: "Autenticação necessária. Faça login para assinar." 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY não configurada");
    }
    logStep("Stripe key verified");

    // Inicializar Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase não configurado");
    }

    // 🔒 Criar cliente Supabase com token do usuário para validação
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader }
      }
    });

    // 🔒 Validar token e obter dados do usuário autenticado (SSOT)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      logStep("ERROR: Invalid or expired token", { error: authError });
      return new Response(JSON.stringify({ 
        error: "Token inválido ou expirado. Faça login novamente." 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    logStep("User authenticated successfully", { 
      userId: user.id, 
      email: user.email 
    });

    const { planCode } = await req.json();
    logStep("Plan code requested", { planCode, userId: user.id });

    if (!planCode) {
      throw new Error("planCode é obrigatório");
    }

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

    // 🔒 Criar checkout session com email do usuário autenticado (SSOT)
    // Email vem de auth.users (fonte confiável), não do frontend
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
      customer_email: user.email, // ✅ Email verificado do auth.users
      billing_address_collection: "required",
      phone_number_collection: {
        enabled: false,
      },
      metadata: {
        user_id: user.id, // ✅ Vinculação imediata ao user_id
        user_email: user.email, // ✅ Para auditoria
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
