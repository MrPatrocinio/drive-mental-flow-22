
import { supabase } from '@/integrations/supabase/client';
import { StripeValidationService } from './stripeValidationService';

/**
 * Serviço responsável por processar pagamentos via Stripe
 * Princípio SRP: Uma única responsabilidade - gerenciar pagamentos
 */
export class StripePaymentService {
  /**
   * Cria uma sessão de pagamento
   */
  static async createPaymentSession(formData: { email: string; name: string }): Promise<{
    success: boolean;
    url?: string;
    sessionId?: string;
    error?: string;
  }> {
    try {
      console.log('[PAYMENT] Iniciando criação de sessão de pagamento');
      
      // Validar dados do formulário
      const validationErrors = StripeValidationService.validatePaymentForm(formData);
      if (validationErrors.length > 0) {
        return {
          success: false,
          error: validationErrors.join('. ')
        };
      }

      console.log('[PAYMENT] Dados validados, chamando edge function');

      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          email: formData.email.trim(),
          name: formData.name.trim()
        }
      });

      if (error) {
        console.error('[PAYMENT] Erro na edge function:', error);
        const friendlyError = StripeValidationService.getPaymentErrorMessage(error);
        return {
          success: false,
          error: friendlyError
        };
      }

      if (!data?.url) {
        console.error('[PAYMENT] URL de pagamento não recebida');
        return {
          success: false,
          error: 'Erro interno: URL de pagamento não recebida'
        };
      }

      console.log('[PAYMENT] Sessão criada com sucesso');
      return {
        success: true,
        url: data.url,
        sessionId: data.sessionId
      };

    } catch (error) {
      console.error('[PAYMENT] Erro inesperado:', error);
      const friendlyError = StripeValidationService.getPaymentErrorMessage(error);
      return {
        success: false,
        error: friendlyError
      };
    }
  }

  /**
   * Verifica o status de um pagamento
   */
  static async verifyPayment(sessionId: string): Promise<{
    success: boolean;
    paymentData?: any;
    error?: string;
  }> {
    try {
      console.log('[PAYMENT] Verificando pagamento:', sessionId);

      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { sessionId }
      });

      if (error) {
        console.error('[PAYMENT] Erro na verificação:', error);
        const friendlyError = StripeValidationService.getPaymentErrorMessage(error);
        return {
          success: false,
          error: friendlyError
        };
      }

      console.log('[PAYMENT] Verificação concluída');
      return {
        success: true,
        paymentData: data
      };

    } catch (error) {
      console.error('[PAYMENT] Erro na verificação:', error);
      const friendlyError = StripeValidationService.getPaymentErrorMessage(error);
      return {
        success: false,
        error: friendlyError
      };
    }
  }
}
