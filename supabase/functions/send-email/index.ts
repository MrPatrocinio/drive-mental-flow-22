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
  template?: 'welcome' | 'payment_success' | 'subscription_reminder' | 'newsletter' | 'retention' | 'winback' | 'trial_reminder';
  data?: Record<string, any>;
}

// URL do logo - ajustar para URL pública do seu domínio
const LOGO_URL = 'https://b7c23806-3309-4153-a75f-9d564d99ecdc.lovableproject.com/lovable-uploads/30944d3c-0c99-44cc-aab1-2d9301e418a4.png';
const APP_URL = 'https://b7c23806-3309-4153-a75f-9d564d99ecdc.lovableproject.com';
const SUPPORT_EMAIL = 'suporte@drivementalapp.com';

const getEmailHeader = (): string => {
  return `
    <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 32px 24px; text-align: center; border-radius: 8px 8px 0 0;">
      <img src="${LOGO_URL}" alt="Drive Mental" style="height: 60px; margin-bottom: 16px;" />
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Drive Mental</h1>
    </div>
  `;
};

const getEmailFooter = (): string => {
  return `
    <div style="margin-top: 48px; padding-top: 32px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
      <p style="margin: 8px 0;"><strong>Drive Mental</strong></p>
      <p style="margin: 8px 0;">Desenvolvimento Mental e Reprogramação Subconsciente</p>
      <p style="margin: 8px 0;">
        📧 <a href="mailto:${SUPPORT_EMAIL}" style="color: #2563eb; text-decoration: none;">${SUPPORT_EMAIL}</a>
      </p>
      <p style="margin: 16px 0 8px; font-size: 12px; color: #9ca3af;">
        © ${new Date().getFullYear()} Drive Mental. Todos os direitos reservados.
      </p>
      <p style="margin: 8px 0; font-size: 12px;">
        <a href="${APP_URL}/privacy-policy" style="color: #6b7280; text-decoration: none; margin: 0 8px;">Política de Privacidade</a> | 
        <a href="${APP_URL}/terms-of-service" style="color: #6b7280; text-decoration: none; margin: 0 8px;">Termos de Uso</a>
      </p>
    </div>
  `;
};

const getEmailTemplate = (template: string, data: Record<string, any> = {}): { subject: string; html: string } => {
  switch (template) {
    case 'welcome':
      return {
        subject: 'Bem-vindo ao Drive Mental! 🧠',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            ${getEmailHeader()}
            <div style="padding: 32px 24px;">
              <h2 style="color: #1e293b; margin: 0 0 16px 0; font-size: 24px;">Bem-vindo ao Drive Mental!</h2>
              <p style="color: #475569; line-height: 1.6; margin: 16px 0;">Olá <strong>${data.name || 'usuário'}</strong>,</p>
              <p style="color: #475569; line-height: 1.6; margin: 16px 0;">Ficamos muito felizes em ter você conosco! Agora você tem acesso à nossa biblioteca completa de áudios para desenvolvimento mental e reprogramação subconsciente.</p>
              <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #2563eb;">
                <p style="color: #1e40af; margin: 0; font-weight: 600;">✨ Comece sua jornada de transformação agora!</p>
              </div>
              <p style="color: #475569; line-height: 1.6; margin: 16px 0;">Para começar, acesse nossa plataforma e explore os diferentes campos de desenvolvimento:</p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${data.loginUrl || APP_URL}" style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">Acessar Plataforma</a>
              </div>
              <p style="color: #475569; line-height: 1.6; margin: 16px 0;">Se tiver alguma dúvida, estamos aqui para ajudar!</p>
              <p style="color: #475569; margin: 24px 0 0 0;">Com carinho,<br><strong>Equipe Drive Mental</strong></p>
            </div>
            ${getEmailFooter()}
          </div>
        `
      };
    case 'payment_success':
      return {
        subject: '✅ Comprovante de Pagamento - Drive Mental',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            ${getEmailHeader()}
            <div style="padding: 32px 24px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); width: 80px; height: 80px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                  <span style="font-size: 48px;">✅</span>
                </div>
                <h2 style="color: #16a34a; margin: 0; font-size: 28px;">Pagamento Confirmado!</h2>
              </div>
              
              <p style="color: #475569; line-height: 1.6; margin: 16px 0;">Olá <strong>${data.name || data.email || 'usuário'}</strong>,</p>
              <p style="color: #475569; line-height: 1.6; margin: 16px 0;">Seu pagamento foi processado com sucesso! Agora você tem acesso completo à plataforma Drive Mental.</p>
              
              <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 24px; margin: 24px 0;">
                <h3 style="color: #1e293b; margin: 0 0 16px 0; font-size: 18px; border-bottom: 2px solid #2563eb; padding-bottom: 8px;">📋 Comprovante de Pagamento</h3>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Cliente:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-weight: 600; text-align: right;">${data.name || data.email || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Email:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-weight: 600; text-align: right;">${data.email || 'N/A'}</td>
                  </tr>
                  <tr style="border-top: 1px solid #e2e8f0;">
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Plano:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-weight: 600; text-align: right;">${data.planName || data.plan || 'Plano Anual'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Valor Pago:</td>
                    <td style="padding: 8px 0; color: #16a34a; font-weight: 700; text-align: right; font-size: 18px;">${data.amount || 'R$ 197,00'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Método:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-weight: 600; text-align: right;">${data.paymentMethod || 'Cartão de Crédito'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Data:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-weight: 600; text-align: right;">${data.paymentDate || new Date().toLocaleDateString('pt-BR')}</td>
                  </tr>
                  <tr style="border-top: 1px solid #e2e8f0;">
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Próxima Cobrança:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-weight: 600; text-align: right;">${data.nextBilling || 'Em 1 ano'}</td>
                  </tr>
                  ${data.transactionId ? `
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">ID Transação:</td>
                    <td style="padding: 8px 0; color: #64748b; font-size: 12px; text-align: right; font-family: monospace;">${data.transactionId}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>
              
              <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #2563eb;">
                <h4 style="color: #1e40af; margin: 0 0 12px 0; font-size: 16px;">🎯 Próximos Passos:</h4>
                <ul style="color: #1e40af; margin: 0; padding-left: 20px; line-height: 1.8;">
                  <li>Acesse a plataforma e complete seu perfil</li>
                  <li>Explore nossa biblioteca de áudios de desenvolvimento mental</li>
                  <li>Configure suas preferências de escuta</li>
                  <li>Comece sua jornada de transformação!</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="${data.loginUrl || APP_URL}" style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; box-shadow: 0 4px 6px rgba(22, 163, 74, 0.3); margin: 8px;">🚀 Acessar Plataforma</a>
                ${data.manageUrl ? `<a href="${data.manageUrl}" style="background: white; color: #2563eb; border: 2px solid #2563eb; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; margin: 8px;">⚙️ Gerenciar Assinatura</a>` : ''}
              </div>
              
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px; margin: 24px 0;">
                <p style="color: #92400e; margin: 0; font-size: 14px;">
                  <strong>💡 Dica:</strong> Verifique sua caixa de entrada para o email de convite se ainda não criou sua senha!
                </p>
              </div>
              
              <p style="color: #475569; line-height: 1.6; margin: 24px 0 0 0;">Obrigado por confiar no Drive Mental!<br><strong>Equipe Drive Mental</strong></p>
            </div>
            ${getEmailFooter()}
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
    case 'retention':
      return {
        subject: 'Sentimos sua falta! Volte ao Drive Mental 💙',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Olá ${data.name || 'usuário'}!</h1>
            <p>Notamos que você não acessa a plataforma há ${data.lastAccess || 'alguns dias'}.</p>
            <p>Que tal retomar sua jornada de desenvolvimento mental? Temos conteúdos novos esperando por você:</p>
            <div style="background-color: #f0f9ff; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <h3>Áudios Recomendados:</h3>
              ${(data.recommendedAudios || []).map((audio: string) => `<p>• ${audio}</p>`).join('')}
            </div>
            <a href="${data.loginUrl || ''}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">Voltar à Plataforma</a>
            <p>Estamos aqui para apoiar seu crescimento!</p>
            <p>Equipe Drive Mental</p>
          </div>
        `
      };
    case 'winback':
      return {
        subject: 'Oferta Especial: ${data.discount || "50%"} de Desconto - Volte ao Drive Mental! 🎯',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #ef4444;">Oferta Especial para Você!</h1>
            <p>Olá ${data.name || 'usuário'},</p>
            <p>Queremos muito ter você de volta! Por isso, preparamos uma oferta especial:</p>
            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 16px 0; text-align: center; border: 2px solid #ef4444;">
              <h2 style="color: #ef4444; margin: 0;">${data.discount || "50%"} DE DESCONTO</h2>
              <p style="margin: 8px 0;">Na sua nova assinatura</p>
              <p style="font-size: 14px; color: #666;">Válido até ${data.validUntil || 'data'}</p>
            </div>
            <p>Reative sua assinatura e volte a desfrutar de todos os nossos áudios premium!</p>
            <a href="${data.renewUrl || ''}" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0; font-weight: bold;">REATIVAR COM DESCONTO</a>
            <p style="font-size: 12px; color: #666;">Oferta por tempo limitado. Não perca!</p>
            <p>Equipe Drive Mental</p>
          </div>
        `
      };
    case 'trial_reminder':
      return {
        subject: 'Seu trial expira em ${data.daysLeft || "2"} dias - Drive Mental ⏰',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #f59e0b;">Trial Expirando em Breve!</h1>
            <p>Olá ${data.name || 'usuário'},</p>
            <p>Seu período de teste gratuito expira em <strong>${data.daysLeft || '2'} dias</strong>.</p>
            <p>Para continuar aproveitando todos os benefícios do Drive Mental, faça upgrade para o plano premium:</p>
            <div style="background-color: #fef3c7; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <h3>Benefícios do Plano Premium:</h3>
              <p>✅ Acesso ilimitado a todos os áudios</p>
              <p>✅ Downloads para uso offline</p>
              <p>✅ Playlists personalizadas</p>
              <p>✅ Novos conteúdos semanais</p>
            </div>
            <a href="${data.upgradeUrl || ''}" style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">Fazer Upgrade Agora</a>
            <p>Não perca o acesso aos seus áudios favoritos!</p>
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