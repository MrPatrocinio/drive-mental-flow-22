import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  template?: 'welcome' | 'payment_success' | 'subscription_reminder' | 'newsletter';
  data?: Record<string, any>;
}

const getEmailTemplate = (template: string, data: Record<string, any> = {}): { subject: string; html: string } => {
  switch (template) {
    case 'welcome':
      return {
        subject: 'Bem-vindo ao Drive Mental! 🧠',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Bem-vindo ao Drive Mental!</h1>
            <p>Olá ${data.name || 'usuário'},</p>
            <p>Ficamos muito felizes em ter você conosco! Agora você tem acesso a nossa biblioteca completa de áudios para desenvolvimento mental.</p>
            <p>Para começar, acesse nossa plataforma e explore os diferentes campos de desenvolvimento:</p>
            <a href="${data.loginUrl || ''}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">Acessar Plataforma</a>
            <p>Se tiver alguma dúvida, estamos aqui para ajudar!</p>
            <p>Equipe Drive Mental</p>
          </div>
        `
      };
    case 'payment_success':
      return {
        subject: 'Pagamento confirmado - Drive Mental ✅',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #16a34a;">Pagamento Confirmado!</h1>
            <p>Olá ${data.name || 'usuário'},</p>
            <p>Seu pagamento foi processado com sucesso! Agora você tem acesso completo à nossa plataforma.</p>
            <div style="background-color: #f0f9ff; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <h3>Detalhes da Assinatura:</h3>
              <p><strong>Plano:</strong> ${data.plan || 'Premium'}</p>
              <p><strong>Valor:</strong> ${data.amount || 'R$ 29,90'}</p>
              <p><strong>Próxima cobrança:</strong> ${data.nextBilling || 'Em 30 dias'}</p>
            </div>
            <a href="${data.loginUrl || ''}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">Acessar Plataforma</a>
            <p>Obrigado por confiar no Drive Mental!</p>
            <p>Equipe Drive Mental</p>
          </div>
        `
      };
    case 'subscription_reminder':
      return {
        subject: 'Lembrete: Renovação da sua assinatura Drive Mental 📅',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #f59e0b;">Lembrete de Renovação</h1>
            <p>Olá ${data.name || 'usuário'},</p>
            <p>Sua assinatura será renovada em ${data.daysUntilRenewal || '3'} dias.</p>
            <div style="background-color: #fef3c7; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p><strong>Data da renovação:</strong> ${data.renewalDate || ''}</p>
              <p><strong>Valor:</strong> ${data.amount || 'R$ 29,90'}</p>
            </div>
            <p>Se você tem alguma dúvida sobre sua assinatura, entre em contato conosco.</p>
            <a href="${data.manageUrl || ''}" style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">Gerenciar Assinatura</a>
            <p>Equipe Drive Mental</p>
          </div>
        `
      };
    case 'newsletter':
      return {
        subject: data.subject || 'Newsletter - Drive Mental 📧',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Drive Mental Newsletter</h1>
            <div style="margin: 24px 0;">
              ${data.content || '<p>Conteúdo da newsletter</p>'}
            </div>
            <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              Você está recebendo este email porque é assinante do Drive Mental.
              <a href="${data.unsubscribeUrl || ''}" style="color: #6b7280;">Cancelar inscrição</a>
            </p>
          </div>
        `
      };
    default:
      return {
        subject: 'Drive Mental',
        html: '<p>Email template not found</p>'
      };
  }
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const { to, subject, html, text, template, data }: EmailRequest = await req.json();

    let emailContent = { subject: subject || '', html: html || '' };
    
    if (template) {
      emailContent = getEmailTemplate(template, data || {});
    }

    const emailResponse = await resend.emails.send({
      from: 'Drive Mental <noreply@drivementalapp.com>',
      to: Array.isArray(to) ? to : [to],
      subject: emailContent.subject,
      html: emailContent.html,
      text: text,
    });

    console.log('Email sent successfully:', emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      id: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error in send-email function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    );
  }
});