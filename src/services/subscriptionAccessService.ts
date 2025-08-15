
import { useSubscription } from '@/hooks/useSubscription';

/**
 * Serviço responsável por verificar acesso baseado em assinatura
 * Princípio SRP: Uma única responsabilidade - verificar acesso baseado em tipo de usuário
 * Modelo: 
 * - Usuários com assinatura ativa = acesso total
 * - Usuários não-assinantes = acesso apenas a áudios não-premium e demo
 */
export class SubscriptionAccessService {
  /**
   * Verifica se o usuário tem acesso completo (assinatura ativa)
   */
  static hasFullAccess(subscribed: boolean, subscriptionTier: string | null): boolean {
    return subscribed && subscriptionTier !== null;
  }

  /**
   * Verifica se o usuário pode acessar um áudio específico
   * Lógica: 
   * - Se tem assinatura ativa: acesso a todos os áudios
   * - Se não tem assinatura: apenas áudios não-premium
   */
  static canAccessAudio(
    subscribed: boolean, 
    subscriptionTier: string | null, 
    isPremium: boolean,
    isDemoAudio: boolean = false
  ): boolean {
    // Usuário com assinatura ativa: acesso total
    if (this.hasFullAccess(subscribed, subscriptionTier)) {
      return true;
    }

    // Usuário sem assinatura: apenas áudios não-premium ou demo
    return !isPremium || isDemoAudio;
  }

  /**
   * Retorna o motivo pelo qual o acesso foi negado
   */
  static getAccessDeniedReason(subscribed: boolean, isPremium: boolean): string {
    if (!subscribed && isPremium) {
      return 'Este conteúdo é exclusivo para assinantes. Faça login e assine para ter acesso completo.';
    }
    
    return 'Erro na verificação da assinatura.';
  }
}

/**
 * Hook para verificação de acesso a conteúdo
 * Princípio DRY: Reutiliza lógica de verificação em toda aplicação
 */
export const useContentAccess = () => {
  const { subscribed, subscription_tier } = useSubscription();

  const hasFullAccess = () => {
    return SubscriptionAccessService.hasFullAccess(subscribed, subscription_tier);
  };

  const canAccessAudio = (isPremium: boolean, isDemoAudio: boolean = false) => {
    return SubscriptionAccessService.canAccessAudio(subscribed, subscription_tier, isPremium, isDemoAudio);
  };

  const getAccessDeniedReason = (isPremium: boolean) => {
    return SubscriptionAccessService.getAccessDeniedReason(subscribed, isPremium);
  };

  return {
    hasFullAccess,
    canAccessAudio,
    getAccessDeniedReason,
    subscribed,
    subscription_tier,
    hasActiveSubscription: subscribed && subscription_tier !== null
  };
};
