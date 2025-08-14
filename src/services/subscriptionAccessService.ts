
/**
 * SubscriptionAccessService - Serviço para verificação de acesso baseado em assinatura
 * Versão simplificada para plano anual único
 * Princípios: SRP, DRY, SSOT, KISS, YAGNI
 */

import { useSecureSubscription } from '@/hooks/useSecureSubscription';

/**
 * Serviço responsável por verificar acesso baseado em assinatura
 * Princípio SRP: Uma única responsabilidade - verificar acesso baseado em status de pagamento
 * Princípio KISS: Lógica binária simples - pagou = acesso / não pagou = sem acesso
 * Princípio YAGNI: Remove complexidade de tiers desnecessária
 */
export class SubscriptionAccessService {
  /**
   * Verifica se o usuário tem acesso completo (assinatura ativa)
   * Princípio SSOT: Uma única fonte de verdade - campo subscribed
   */
  static hasFullAccess(subscribed: boolean): boolean {
    return subscribed;
  }

  /**
   * Verifica se o usuário pode acessar um áudio específico
   * Princípio DRY: Lógica reutilizável para verificação de acesso
   * Simplificado: Se tem assinatura = acesso total, se não tem = apenas demo
   */
  static canAccessAudio(
    subscribed: boolean,
    isPremium: boolean,
    isDemoAudio: boolean = false
  ): boolean {
    // Usuário com assinatura ativa: acesso total
    if (subscribed) {
      return true;
    }

    // Usuário sem assinatura: apenas áudios não-premium ou demo
    return !isPremium || isDemoAudio;
  }

  /**
   * Retorna o motivo pelo qual o acesso foi negado
   * Princípio SSOT: Fonte única para mensagens de erro
   */
  static getAccessDeniedReason(subscribed: boolean, isPremium: boolean): string {
    if (!subscribed && isPremium) {
      return 'Este conteúdo é exclusivo para assinantes. Assine por apenas R$ 127,00/ano e tenha acesso completo.';
    }
    
    return 'Erro na verificação da assinatura.';
  }
}

/**
 * Hook para verificação de acesso a conteúdo usando serviço seguro
 * Princípio DRY: Reutiliza lógica de verificação em toda aplicação
 * Simplificado para modelo binário de assinatura
 */
export const useContentAccess = () => {
  const { subscribed } = useSecureSubscription();

  const hasFullAccess = () => {
    return SubscriptionAccessService.hasFullAccess(subscribed);
  };

  const canAccessAudio = (isPremium: boolean, isDemoAudio: boolean = false) => {
    return SubscriptionAccessService.canAccessAudio(subscribed, isPremium, isDemoAudio);
  };

  const getAccessDeniedReason = (isPremium: boolean) => {
    return SubscriptionAccessService.getAccessDeniedReason(subscribed, isPremium);
  };

  return {
    hasFullAccess,
    canAccessAudio,
    getAccessDeniedReason,
    subscribed,
    hasActiveSubscription: subscribed
  };
};
