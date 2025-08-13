
import { useSubscription } from '@/hooks/useSubscription';

/**
 * Serviço responsável por verificar acesso baseado em assinatura
 * Princípio SRP: Uma única responsabilidade - verificar acesso premium
 * Modelo: Usuários logados com assinatura ativa = acesso total
 */
export class SubscriptionAccessService {
  /**
   * Verifica se o usuário tem acesso a conteúdo (todos os áudios são premium)
   */
  static hasAccessToContent(subscribed: boolean, subscriptionTier: string | null): boolean {
    return subscribed && subscriptionTier !== null;
  }

  /**
   * Verifica se o usuário pode acessar um áudio
   * No novo modelo: todos os áudios requerem assinatura ativa
   */
  static canAccessAudio(subscribed: boolean, subscriptionTier: string | null): boolean {
    return this.hasAccessToContent(subscribed, subscriptionTier);
  }

  /**
   * Retorna o motivo pelo qual o acesso foi negado
   */
  static getAccessDeniedReason(subscribed: boolean): string {
    if (!subscribed) {
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

  const canAccessContent = () => {
    return SubscriptionAccessService.hasAccessToContent(subscribed, subscription_tier);
  };

  const canAccessAudio = () => {
    return SubscriptionAccessService.canAccessAudio(subscribed, subscription_tier);
  };

  const getAccessDeniedReason = () => {
    return SubscriptionAccessService.getAccessDeniedReason(subscribed);
  };

  return {
    canAccessContent,
    canAccessAudio,
    getAccessDeniedReason,
    subscribed,
    subscription_tier,
    hasActiveSubscription: subscribed && subscription_tier !== null
  };
};
