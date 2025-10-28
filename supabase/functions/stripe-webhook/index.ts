import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[WEBHOOK] Recebendo webhook do Stripe...');

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY não configurada');
    }
    
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET não configurada');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      throw new Error('Stripe signature não encontrada');
    }

    const body = await req.text();

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
      console.log('[WEBHOOK] Assinatura verificada com sucesso');
    } catch (err) {
      console.error('[WEBHOOK] Erro ao verificar assinatura:', err);
      return new Response(
        JSON.stringify({ error: 'Assinatura inválida' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('[WEBHOOK] Processando evento:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('[WEBHOOK] Processing checkout.session.completed for session:', session.id);

        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;
        const customerEmail = session.customer_details?.email;
        
        // 🔒 Ler metadados da sessão
        const userId = session.metadata?.user_id;
        const userEmail = session.metadata?.user_email;
        const isNewUser = session.metadata?.is_new_user === 'true';

        if (!subscriptionId || !customerId) {
          console.error('[WEBHOOK] Missing subscription or customer ID');
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;

        console.log('[WEBHOOK] Subscription:', subscription.id, 'Status:', subscription.status);
        console.log('[WEBHOOK] Customer:', customer.id, 'Email:', customerEmail);
        console.log('[WEBHOOK] User ID from metadata:', userId, 'Is new user:', isNewUser);

        let tier = 'quarterly';
        if (subscription.items.data[0]?.price?.id) {
          const priceId = subscription.items.data[0].price.id;
          if (priceId.includes('monthly')) tier = 'monthly';
          else if (priceId.includes('quarterly')) tier = 'quarterly';
          else if (priceId.includes('annual')) tier = 'annual';
        }

        const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

        // 🆕 LÓGICA PAY-FIRST: Criar usuário automaticamente se for novo
        let finalUserId = userId;

        if (isNewUser && !userId && customerEmail) {
          console.log('[WEBHOOK] Creating new user for:', customerEmail);
          
          try {
            // 1. Criar usuário via Admin API (SEM SENHA)
            const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
              email: customerEmail,
              email_confirm: true,
              user_metadata: {
                display_name: customerEmail.split('@')[0],
                created_via: 'stripe_checkout',
                stripe_customer_id: customerId,
                subscription_tier: tier,
                created_at: new Date().toISOString()
              }
            });
            
            if (createError) {
              console.error('[WEBHOOK] Error creating user:', createError);
              // Salvar em pending_subscriptions para retry manual
              await supabase.from('pending_subscriptions').insert({
                email: customerEmail,
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
                session_id: session.id,
                subscription_tier: tier,
              });
              break;
            }
            
            finalUserId = newUser.user.id;
            console.log('[WEBHOOK] User created successfully:', finalUserId);
            
            // 2. Enviar convite para definir senha
            const appUrl = Deno.env.get('APP_URL') || 'https://b7c23806-3309-4153-a75f-9d564d99ecdc.lovableproject.com';
            const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
              customerEmail,
              { redirectTo: `${appUrl}/onboarding/definir-senha` }
            );
            
            if (inviteError) {
              console.error('[WEBHOOK] Error sending invite:', inviteError);
            } else {
              console.log('[WEBHOOK] Invite email sent to:', customerEmail);
            }
          } catch (error) {
            console.error('[WEBHOOK] Exception creating user:', error);
            finalUserId = null;
          }
        }

        // 🔒 Vinculação da assinatura ao usuário
        if (finalUserId && (userEmail || customerEmail)) {
          console.log('[WEBHOOK] Linking subscription to user:', finalUserId);
          
          const { error: upsertError } = await supabase
            .from('subscribers')
            .upsert({
              user_id: finalUserId,
              email: userEmail || customerEmail,
              stripe_customer_id: customer.id,
              stripe_subscription_id: subscription.id,
              subscription_status: subscription.status as any,
              subscribed: subscription.status === 'active' || subscription.status === 'trialing',
              subscription_tier: tier,
              subscription_end: currentPeriodEnd.toISOString(),
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'user_id'
            });

          if (upsertError) {
            console.error('[WEBHOOK] Error upserting subscriber:', upsertError);
          } else {
            console.log('[WEBHOOK] Subscriber linked successfully to user_id:', finalUserId);
          }
        } else {
          // Fallback para lógica antiga (compatibilidade com pending_subscriptions)
          console.log('[WEBHOOK] No user_id in metadata, using legacy flow');
          
          const { data: existingSubscriber } = await supabase
            .from('subscribers')
            .select('user_id')
            .eq('email', customerEmail || '')
            .maybeSingle();

          if (existingSubscriber?.user_id) {
            console.log('[WEBHOOK] User exists, updating subscriber');
            await supabase
              .from('subscribers')
              .update({
                stripe_customer_id: customer.id,
                stripe_subscription_id: subscription.id,
                subscription_status: subscription.status as any,
                subscribed: subscription.status === 'active' || subscription.status === 'trialing',
                subscription_tier: tier,
                subscription_end: currentPeriodEnd.toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq('email', customerEmail || '');
          } else {
            console.log('[WEBHOOK] User not found, saving to pending_subscriptions');
            await supabase
              .from('pending_subscriptions')
              .insert({
                email: customerEmail || '',
                stripe_customer_id: customer.id,
                stripe_subscription_id: subscription.id,
                session_id: session.id,
                subscription_tier: tier,
              });
          }
        }

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('[WEBHOOK] Assinatura atualizada:', subscription.id);
        
        const customerId = subscription.customer as string;
        const userId = subscription.metadata?.user_id;
        
        const customer = await stripe.customers.retrieve(customerId);
        const customerEmail = (customer as Stripe.Customer).email;
        
        if (!customerEmail && !userId) {
          console.error('[WEBHOOK] Nem email nem user_id encontrado');
          break;
        }

        const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
        const subscriptionStatus = subscription.status;

        console.log('[WEBHOOK] Atualizando status:', {
          userId,
          email: customerEmail,
          subscriptionId: subscription.id,
          status: subscriptionStatus,
          end: subscriptionEnd
        });

        const updateData: any = {
          stripe_subscription_id: subscription.id,
          subscription_status: subscriptionStatus,
          subscription_end: subscriptionEnd,
          updated_at: new Date().toISOString(),
        };

        let query = supabase.from('subscribers').update(updateData);
        
        const { data: existingSub } = await supabase
          .from('subscribers')
          .select('id')
          .eq('stripe_subscription_id', subscription.id)
          .maybeSingle();
        
        if (existingSub) {
          query = query.eq('stripe_subscription_id', subscription.id);
        } else {
          query = query.eq('stripe_customer_id', customerId);
        }

        const { error: updateError } = await query;

        if (updateError) {
          console.error('[WEBHOOK] Erro ao atualizar subscriber:', updateError);
        } else {
          console.log('[WEBHOOK] Status atualizado com sucesso');
        }

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

        const { data: existingSub } = await supabase
          .from('subscribers')
          .select('id')
          .eq('stripe_subscription_id', subscription.id)
          .maybeSingle();

        let query = supabase
          .from('subscribers')
          .update({
            subscription_status: 'canceled',
            subscription_end: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        
        if (existingSub) {
          query = query.eq('stripe_subscription_id', subscription.id);
        } else {
          query = query.eq('stripe_customer_id', customerId);
        }

        const { error: deactivateError } = await query;

        if (deactivateError) {
          console.error('[WEBHOOK] Erro ao desativar assinatura:', deactivateError);
        } else {
          console.log('[WEBHOOK] Assinatura desativada com sucesso');
        }

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('[WEBHOOK] Pagamento de fatura bem-sucedido:', invoice.id);
        
        const customerId = invoice.customer as string;
        const subscriptionId = invoice.subscription as string;
        
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId as string);
          const customer = await stripe.customers.retrieve(customerId);
          const customerEmail = (customer as Stripe.Customer).email;
          
          const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
          
          console.log('[WEBHOOK] Atualizando período de assinatura:', {
            subscriptionId,
            email: customerEmail,
            end: subscriptionEnd
          });

          const { data: existingSub } = await supabase
            .from('subscribers')
            .select('id')
            .eq('stripe_subscription_id', subscriptionId)
            .maybeSingle();

          let query = supabase
            .from('subscribers')
            .update({
              stripe_subscription_id: subscriptionId,
              subscription_status: 'active',
              subscription_end: subscriptionEnd,
              updated_at: new Date().toISOString(),
            });
          
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
