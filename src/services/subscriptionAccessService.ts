

import { useCallback, useMemo } from 'react';
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
 * OTIMIZADO: Funções memoizadas para evitar re-renders
 */
export const useContentAccess = () => {
  const { subscribed, subscription_tier } = useSubscription();

  // Memoizar verificações para evitar recriações
  const hasFullAccess = useMemo(() => {
    return SubscriptionAccessService.hasFullAccess(subscribed, subscription_tier);
  }, [subscribed, subscription_tier]);

  const hasActiveSubscription = useMemo(() => {
    return subscribed && subscription_tier !== null;
  }, [subscribed, subscription_tier]);

  // Função estável com useCallback
  const canAccessAudio = useCallback((isPremium: boolean = false, isDemoAudio: boolean = false) => {
    return SubscriptionAccessService.canAccessAudio(subscribed, subscription_tier, isPremium, isDemoAudio);
  }, [subscribed, subscription_tier]);

  const getAccessDeniedReason = useCallback((isPremium: boolean = false) => {
    return SubscriptionAccessService.getAccessDeniedReason(subscribed, isPremium);
  }, [subscribed]);

  return {
    hasFullAccess,
    canAccessAudio,
    getAccessDeniedReason,
    subscribed,
    subscription_tier,
    hasActiveSubscription
  };
};

