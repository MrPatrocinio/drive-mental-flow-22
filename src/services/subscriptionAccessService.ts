
import { useSubscription } from '@/hooks/useSubscription';

/**
 * Serviço responsável por verificar acesso baseado em assinatura
 * Princípio SRP: Uma única responsabilidade - verificar acesso
 * ATUALIZADO: Agora todos os áudios são acessíveis, sem diferenciação premium
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
   * NOVA LÓGICA: Todos os áudios são acessíveis - sem diferenciação premium
   */
  static canAccessAudio(
    subscribed: boolean, 
    subscriptionTier: string | null, 
    isPremium: boolean = false,
    isDemoAudio: boolean = false
  ): boolean {
    // TODOS os áudios são acessíveis agora
    return true;
  }

  /**
   * Retorna o motivo pelo qual o acesso foi negado
   * Mantido para compatibilidade, mas todos têm acesso agora
   */
  static getAccessDeniedReason(subscribed: boolean, isPremium: boolean): string {
    return 'Todos os áudios estão disponíveis.';
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

  const canAccessAudio = (isPremium: boolean = false, isDemoAudio: boolean = false) => {
    return SubscriptionAccessService.canAccessAudio(subscribed, subscription_tier, isPremium, isDemoAudio);
  };

  const getAccessDeniedReason = (isPremium: boolean = false) => {
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
