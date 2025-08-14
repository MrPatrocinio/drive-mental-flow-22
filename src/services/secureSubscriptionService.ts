
/**
 * SecureSubscriptionService - Serviço seguro para gerenciamento de assinaturas
 * Responsabilidade: Operações seguras de assinatura seguindo RLS
 * Princípios: SRP (uma responsabilidade), DRY (reutilização), SSOT (fonte única)
 */

import { supabase } from '@/integrations/supabase/client';
import { SecurityValidationService } from './securityValidationService';

export interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
}

/**
 * Serviço para operações seguras de assinatura
 */
export class SecureSubscriptionService {

  /**
   * Busca dados de assinatura do usuário atual
   * Princípio SRP: Responsabilidade única - buscar assinatura
   * Princípio KISS: Implementação simples seguindo RLS
   */
  static async getCurrentUserSubscription(): Promise<{
    data: SubscriptionData | null;
    error: string | null;
  }> {
    try {
      // Validar acesso primeiro
      const validation = await SecurityValidationService.validateSubscriptionAccess();
      if (!validation.isValid) {
        await SecurityValidationService.logSecurityEvent('subscription_access_denied', false, {
          reason: validation.error
        });
        return {
          data: null,
          error: validation.error || 'Acesso negado'
        };
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          data: null,
          error: 'Usuário não autenticado'
        };
      }

      // Buscar assinatura - RLS vai garantir que só vê os próprios dados
      const { data, error } = await supabase
        .from('subscribers')
        .select('subscribed, subscription_tier, subscription_end')
        .or(`user_id.eq.${user.id},email.eq.${user.email}`)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('[SECURE_SUBSCRIPTION] Erro ao buscar assinatura:', error);
        await SecurityValidationService.logSecurityEvent('subscription_fetch_error', false, {
          error: error.message
        });
        return {
          data: null,
          error: 'Erro ao verificar assinatura'
        };
      }

      await SecurityValidationService.logSecurityEvent('subscription_fetch_success', true);

      // Retornar dados ou default se não encontrou
      return {
        data: data || {
          subscribed: false,
          subscription_tier: null,
          subscription_end: null
        },
        error: null
      };

    } catch (error) {
      console.error('[SECURE_SUBSCRIPTION] Erro geral:', error);
      await SecurityValidationService.logSecurityEvent('subscription_fetch_exception', false, {
        error: (error as Error).message
      });
      return {
        data: null,
        error: 'Erro interno na verificação de assinatura'
      };
    }
  }

  /**
   * Cria ou atualiza assinatura do usuário atual
   * Princípio SRP: Responsabilidade única - upsert assinatura
   */
  static async upsertUserSubscription(subscriptionData: Partial<SubscriptionData>): Promise<{
    success: boolean;
    error: string | null;
  }> {
    try {
      // Validar acesso primeiro
      const validation = await SecurityValidationService.validateSubscriptionAccess();
      if (!validation.isValid) {
        await SecurityValidationService.logSecurityEvent('subscription_upsert_denied', false, {
          reason: validation.error
        });
        return {
          success: false,
          error: validation.error || 'Acesso negado'
        };
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          error: 'Usuário não autenticado'
        };
      }

      // Preparar dados para upsert
      const upsertData = {
        user_id: user.id,
        email: user.email!,
        ...subscriptionData,
        updated_at: new Date().toISOString()
      };

      // Realizar upsert - RLS vai garantir segurança
      const { error } = await supabase
        .from('subscribers')
        .upsert(upsertData, {
          onConflict: 'user_id,email'
        });

      if (error) {
        console.error('[SECURE_SUBSCRIPTION] Erro no upsert:', error);
        await SecurityValidationService.logSecurityEvent('subscription_upsert_error', false, {
          error: error.message
        });
        return {
          success: false,
          error: 'Erro ao atualizar assinatura'
        };
      }

      await SecurityValidationService.logSecurityEvent('subscription_upsert_success', true);
      
      return {
        success: true,
        error: null
      };

    } catch (error) {
      console.error('[SECURE_SUBSCRIPTION] Erro no upsert:', error);
      await SecurityValidationService.logSecurityEvent('subscription_upsert_exception', false, {
        error: (error as Error).message
      });
      return {
        success: false,
        error: 'Erro interno na atualização de assinatura'
      };
    }
  }
}
