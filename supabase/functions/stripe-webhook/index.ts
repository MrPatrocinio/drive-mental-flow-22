import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[WEBHOOK] Recebendo webhook do Stripe...');

    // Get Stripe keys
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY não configurada');
    }
    
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET não configurada');
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Get the signature from headers
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      throw new Error('Stripe signature não encontrada');
    }

    // Get raw body
    const body = await req.text();

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log('[WEBHOOK] Assinatura verificada com sucesso');
    } catch (err) {
      console.error('[WEBHOOK] Erro ao verificar assinatura:', err);
      return new Response(
        JSON.stringify({ error: 'Assinatura inválida' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('[WEBHOOK] Processando evento:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('[WEBHOOK] Checkout completado:', session.id);
        
        // Get customer and subscription details
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        
        if (!customerId || !subscriptionId) {
          console.error('[WEBHOOK] Customer ID ou Subscription ID não encontrado');
          break;
        }

        // 🔥 FASE 1: Recuperar user_id da metadata (prioridade)
        const userId = session.metadata?.user_id;
        
        // Get subscription details from Stripe
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const customer = await stripe.customers.retrieve(customerId);
        
        const customerEmail = (customer as Stripe.Customer).email;
        if (!customerEmail && !userId) {
          console.error('[WEBHOOK] Nem email nem user_id encontrado');
          break;
        }

        // Get plan tier from metadata or subscription
        const planTier = session.metadata?.subscription_plan || 'premium';
        
        // Calculate subscription end date
        const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
        
        // 🔥 FASE 2: Usar status detalhado do Stripe
        const subscriptionStatus = subscription.status; // 'active', 'trialing', etc.

        console.log('[WEBHOOK] Atualizando subscriber:', {
          userId,
          email: customerEmail,
          tier: planTier,
          subscriptionId,
          status: subscriptionStatus,
          end: subscriptionEnd
        });

        // 🔥 FASE 2: Incluir subscription_status (subscribed será sincronizado via trigger)
        const subscriberData: any = {
          email: customerEmail!,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          subscription_status: subscriptionStatus,
          subscription_tier: planTier,
          subscription_end: subscriptionEnd,
          updated_at: new Date().toISOString(),
        };

        // Adicionar user_id se disponível (prioridade)
        if (userId) {
          subscriberData.user_id = userId;
        }

        // Update or insert subscriber (usando email como fallback para onConflict)
        const { error: upsertError } = await supabase
          .from('subscribers')
          .upsert(subscriberData, {
            onConflict: userId ? 'user_id' : 'email'
          });

        if (upsertError) {
          console.error('[WEBHOOK] Erro ao atualizar subscriber:', upsertError);
          throw upsertError;
        }

        console.log('[WEBHOOK] Subscriber atualizado com sucesso');
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('[WEBHOOK] Assinatura atualizada:', subscription.id);
        
        const customerId = subscription.customer as string;
        
        // 🔥 FASE 1: Tentar recuperar user_id da metadata da subscription
        const userId = subscription.metadata?.user_id;
        
        const customer = await stripe.customers.retrieve(customerId);
        const customerEmail = (customer as Stripe.Customer).email;
        
        if (!customerEmail && !userId) {
          console.error('[WEBHOOK] Nem email nem user_id encontrado');
          break;
        }

        // Calculate subscription end date
        const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
        
        // 🔥 FASE 2: Usar status detalhado do Stripe
        const subscriptionStatus = subscription.status;

        console.log('[WEBHOOK] Atualizando status:', {
          userId,
          email: customerEmail,
          subscriptionId: subscription.id,
          status: subscriptionStatus,
          end: subscriptionEnd
        });

        // 🔥 FASE 2: Usar subscription_status (subscribed sincroniza via trigger)
        const updateData: any = {
          stripe_subscription_id: subscription.id,
          subscription_status: subscriptionStatus,
          subscription_end: subscriptionEnd,
          updated_at: new Date().toISOString(),
        };

        // Update subscriber status (priorizar por stripe_subscription_id, fallback para customer_id)
        let query = supabase.from('subscribers').update(updateData);
        
        // Prioridade: buscar por subscription_id, depois por customer_id
        const { data: existingSub } = await supabase
          .from('subscribers')
          .select('id')
          .eq('stripe_subscription_id', subscription.id)
          .single();
        
        if (existingSub) {
          query = query.eq('stripe_subscription_id', subscription.id);
        } else {
          query = query.eq('stripe_customer_id', customerId);
        }

        const { error: updateError } = await query;

        if (updateError) {
          console.error('[WEBHOOK] Erro ao atualizar subscriber:', updateError);
          throw updateError;
        }

        console.log('[WEBHOOK] Status atualizado com sucesso');
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('[WEBHOOK] Assinatura cancelada:', subscription.id);
        
        const customerId = subscription.customer as string;
        const customer = await stripe.customers.retrieve(customerId);
        const customerEmail = (customer as Stripe.Customer).email;
        
        console.log('[WEBHOOK] Desativando assinatura:', {
          subscriptionId: subscription.id,
          customerId,
          email: customerEmail
        });

        // 🔥 FASE 1: Buscar por subscription_id primeiro
        const { data: existingSub } = await supabase
          .from('subscribers')
          .select('id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        // 🔥 FASE 2: Marcar como 'canceled' (não 'none' pois pode ainda estar ativa até o fim do período)
        // Deactivate subscription
        let query = supabase
          .from('subscribers')
          .update({
            subscription_status: 'canceled',
            subscription_end: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        
        // Priorizar busca por subscription_id
        if (existingSub) {
          query = query.eq('stripe_subscription_id', subscription.id);
        } else {
          query = query.eq('stripe_customer_id', customerId);
        }

        const { error: deactivateError } = await query;

        if (deactivateError) {
          console.error('[WEBHOOK] Erro ao desativar assinatura:', deactivateError);
          throw deactivateError;
        }

        console.log('[WEBHOOK] Assinatura desativada com sucesso');
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('[WEBHOOK] Pagamento de fatura bem-sucedido:', invoice.id);
        
        // This happens on recurring payments
        const customerId = invoice.customer as string;
        const subscriptionId = invoice.subscription as string;
        
        if (subscriptionId) {
          // Get updated subscription details
          const subscription = await stripe.subscriptions.retrieve(subscriptionId as string);
          const customer = await stripe.customers.retrieve(customerId);
          const customerEmail = (customer as Stripe.Customer).email;
          
          const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
          
          console.log('[WEBHOOK] Atualizando período de assinatura:', {
            subscriptionId,
            email: customerEmail,
            end: subscriptionEnd
          });

          // 🔥 FASE 1: Buscar por subscription_id primeiro
          const { data: existingSub } = await supabase
            .from('subscribers')
            .select('id')
            .eq('stripe_subscription_id', subscriptionId)
            .single();

          // 🔥 FASE 2: Renovação bem-sucedida = 'active'
          // Update subscription period
          let query = supabase
            .from('subscribers')
            .update({
              stripe_subscription_id: subscriptionId,
              subscription_status: 'active',
              subscription_end: subscriptionEnd,
              updated_at: new Date().toISOString(),
            });
          
          // Priorizar por subscription_id
          if (existingSub) {
            query = query.eq('stripe_subscription_id', subscriptionId);
          } else {
            query = query.eq('stripe_customer_id', customerId);
          }

          const { error: updateError } = await query;

          if (updateError) {
            console.error('[WEBHOOK] Erro ao atualizar período:', updateError);
          } else {
            console.log('[WEBHOOK] Período atualizado com sucesso');
          }
        }
        break;
      }

      default:
        console.log('[WEBHOOK] Evento não tratado:', event.type);
    }

    // Return success response
    return new Response(
      JSON.stringify({ received: true }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('[WEBHOOK] Erro ao processar webhook:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro ao processar webhook',
        details: error.message 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
