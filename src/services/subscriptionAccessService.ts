
import { useSubscription } from '@/hooks/useSubscription';

/**
 * Serviço responsável por verificar acesso baseado em assinatura
 * Princípio SRP: Uma única responsabilidade - verificar acesso premium
 */
export class SubscriptionAccessService {
  /**
   * Verifica se o usuário tem acesso a conteúdo premium
   */
  static hasAccessToPremiumContent(subscribed: boolean, subscriptionTier: string | null): boolean {
    return subscribed && subscriptionTier !== null;
  }

  /**
   * Verifica se o usuário pode acessar um áudio específico
   */
  static canAccessAudio(isPremium: boolean, subscribed: boolean, subscriptionTier: string | null): boolean {
    // Conteúdo gratuito: sempre acessível
    if (!isPremium) {
      return true;
    }
    
    // Conteúdo premium: requer assinatura ativa
    return this.hasAccessToPremiumContent(subscribed, subscriptionTier);
  }

  /**
   * Retorna o motivo pelo qual o acesso foi negado
   */
  static getAccessDeniedReason(isPremium: boolean, subscribed: boolean): string {
    if (!isPremium) {
      return '';
    }
    
    if (!subscribed) {
      return 'Este conteúdo é exclusivo para assinantes premium.';
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

  const canAccessPremiumContent = () => {
    return SubscriptionAccessService.hasAccessToPremiumContent(subscribed, subscription_tier);
  };

  const canAccessAudio = (isPremium: boolean) => {
    return SubscriptionAccessService.canAccessAudio(isPremium, subscribed, subscription_tier);
  };

  const getAccessDeniedReason = (isPremium: boolean) => {
    return SubscriptionAccessService.getAccessDeniedReason(isPremium, subscribed);
  };

  return {
    canAccessPremiumContent,
    canAccessAudio,
    getAccessDeniedReason,
    subscribed,
    subscription_tier
  };
};
