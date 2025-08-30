import { supabase } from "@/integrations/supabase/client";

export interface EmailTemplate {
  template: 'welcome' | 'payment_success' | 'subscription_reminder' | 'newsletter';
  data?: Record<string, any>;
}

export interface CustomEmail {
  subject: string;
  html?: string;
  text?: string;
}

export interface EmailRequest {
  to: string | string[];
  template?: EmailTemplate;
  custom?: CustomEmail;
}

/**
 * Serviço responsável pelo envio de emails
 * Responsabilidade: Comunicação por email via Edge Functions
 */
export class EmailService {
  /**
   * Envia email usando template predefinido
   */
  static async sendTemplateEmail(
    to: string | string[], 
    template: EmailTemplate['template'], 
    data?: Record<string, any>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: response, error } = await supabase.functions.invoke('send-email', {
        body: {
          to,
          template,
          data
        }
      });

      if (error) {
        console.error('Erro ao enviar email:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Erro no serviço de email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envia email customizado
   */
  static async sendCustomEmail(
    to: string | string[], 
    subject: string, 
    html?: string, 
    text?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: response, error } = await supabase.functions.invoke('send-email', {
        body: {
          to,
          subject,
          html,
          text
        }
      });

      if (error) {
        console.error('Erro ao enviar email customizado:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Erro no serviço de email customizado:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envia email de boas-vindas
   */
  static async sendWelcomeEmail(
    email: string, 
    name?: string, 
    loginUrl?: string
  ): Promise<{ success: boolean; error?: string }> {
    return this.sendTemplateEmail(email, 'welcome', {
      name,
      loginUrl: loginUrl || window.location.origin
    });
  }

  /**
   * Envia email de confirmação de pagamento
   */
  static async sendPaymentSuccessEmail(
    email: string, 
    data: {
      name?: string;
      plan?: string;
      amount?: string;
      nextBilling?: string;
      loginUrl?: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    return this.sendTemplateEmail(email, 'payment_success', {
      ...data,
      loginUrl: data.loginUrl || window.location.origin
    });
  }

  /**
   * Envia lembrete de renovação
   */
  static async sendSubscriptionReminderEmail(
    email: string, 
    data: {
      name?: string;
      daysUntilRenewal?: number;
      renewalDate?: string;
      amount?: string;
      manageUrl?: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    return this.sendTemplateEmail(email, 'subscription_reminder', data);
  }

  /**
   * Envia newsletter/campanha
   */
  static async sendNewsletterEmail(
    emails: string[], 
    subject: string, 
    content: string, 
    unsubscribeUrl?: string
  ): Promise<{ success: boolean; error?: string }> {
    return this.sendTemplateEmail(emails, 'newsletter', {
      subject,
      content,
      unsubscribeUrl
    });
  }
}