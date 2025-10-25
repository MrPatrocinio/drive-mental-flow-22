import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ ok: false, message: 'Unauthorized: Missing token' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ ok: false, message: 'Unauthorized: Invalid token' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return new Response(
        JSON.stringify({ ok: false, message: 'Forbidden: Admin role required' }), 
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const enrollmentId = pathParts[pathParts.length - 1];

    if (!enrollmentId) {
      return new Response(
        JSON.stringify({ ok: false, message: 'Missing enrollment ID' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar dados do enrollment
    const { data: enrollment, error: fetchError } = await supabase
      .from('guarantee_enrollments')
      .select(`
        *,
        subscribers!inner(stripe_subscription_id, stripe_customer_id)
      `)
      .eq('id', enrollmentId)
      .single();

    if (fetchError || !enrollment) {
      return new Response(
        JSON.stringify({ ok: false, message: 'Enrollment não encontrado' }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Processar reembolso via Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2023-10-16',
    });

    const subscription = await stripe.subscriptions.retrieve(
      enrollment.subscribers.stripe_subscription_id
    );

    // Buscar payment intent da última fatura
    if (subscription.latest_invoice) {
      const invoice = await stripe.invoices.retrieve(
        subscription.latest_invoice as string
      );

      if (invoice.payment_intent) {
        await stripe.refunds.create({
          payment_intent: invoice.payment_intent as string,
          reason: 'requested_by_customer',
        });
      }
    }

    // Cancelar assinatura
    await stripe.subscriptions.cancel(enrollment.subscribers.stripe_subscription_id);

    // Atualizar status no banco
    await supabase
      .from('guarantee_enrollments')
      .update({ 
        status: 'refunded',
        decision_reason: 'Reembolso aprovado pelo administrador',
        decided_at: new Date().toISOString(),
        decided_by: user.id
      })
      .eq('id', enrollmentId);

    // Atualizar subscriber
    await supabase
      .from('subscribers')
      .update({
        subscription_status: 'canceled',
        subscribed: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', enrollment.user_id);

    return new Response(
      JSON.stringify({ 
        ok: true, 
        message: 'Reembolso processado com sucesso' 
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing refund:', error);
    return new Response(
      JSON.stringify({ ok: false, message: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
