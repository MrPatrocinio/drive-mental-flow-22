
/**
 * SecurityValidationService - Serviço para validação de segurança
 * Responsabilidade: SSOT para validações de segurança da aplicação
 * Princípio SRP: Apenas lógica de validação de segurança
 * Princípio KISS: Validações simples e diretas
 */

import { supabase } from '@/integrations/supabase/client';

export interface SecurityValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Serviço para validações de segurança centralizadas
 */
export class SecurityValidationService {
  
  /**
   * Valida se o usuário atual tem acesso a dados de assinatura
   * Princípio SRP: Uma responsabilidade - validar acesso
   */
  static async validateSubscriptionAccess(
    targetUserId?: string | null, 
    targetEmail?: string | null
  ): Promise<SecurityValidationResult> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          isValid: false,
          error: 'Usuário não autenticado'
        };
      }

      // Validar se tem acesso aos dados solicitados
      const hasAccess = (
        (targetUserId && targetUserId === user.id) ||
        (targetEmail && targetEmail === user.email) ||
        (!targetUserId && !targetEmail) // Busca próprios dados
      );

      if (!hasAccess) {
        return {
          isValid: false,
          error: 'Acesso negado aos dados solicitados'
        };
      }

      return { isValid: true };
    } catch (error) {
      console.error('[SECURITY] Erro na validação de acesso:', error);
      return {
        isValid: false,
        error: 'Erro na validação de segurança'
      };
    }
  }

  /**
   * Valida se o usuário é admin
   * Princípio KISS: Validação simples e direta
   */
  static async validateAdminAccess(): Promise<SecurityValidationResult> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          isValid: false,
          error: 'Usuário não autenticado'
        };
      }

      // Buscar role do usuário
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('[SECURITY] Erro ao verificar role:', error);
        return {
          isValid: false,
          error: 'Erro na verificação de permissões'
        };
      }

      const isAdmin = profile?.role === 'admin';
      
      return {
        isValid: isAdmin,
        error: isAdmin ? undefined : 'Acesso de administrador necessário'
      };
    } catch (error) {
      console.error('[SECURITY] Erro na validação de admin:', error);
      return {
        isValid: false,
        error: 'Erro na validação de segurança'
      };
    }
  }

  /**
   * Registra tentativa de acesso para auditoria
   * Princípio DRY: Função reutilizável para logging
   */
  static async logSecurityEvent(
    action: string,
    success: boolean,
    details?: Record<string, any>
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Log apenas se usuário autenticado
      if (user) {
        console.log('[SECURITY_AUDIT]', {
          user_id: user.id,
          action,
          success,
          details,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('[SECURITY] Erro no log de auditoria:', error);
    }
  }
}
