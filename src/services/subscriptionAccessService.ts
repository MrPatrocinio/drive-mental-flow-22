

import { useCallback, useMemo } from 'react';
import { useSubscription } from '@/hooks/useSubscription';

/**
 * Serviço responsável por verificar acesso baseado em assinatura
 * Princípio SRP: Uma única responsabilidade - verificar acesso
 * SEGURANÇA: Implementa verificação de assinatura para conteúdo premium
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
   * LÓGICA DE SEGURANÇA: Verifica assinatura para conteúdo premium
   */
  static canAccessAudio(
    subscribed: boolean, 
    subscriptionTier: string | null, 
    isPremium: boolean = false,
    isDemoAudio: boolean = false
  ): boolean {
    // 1. Áudios demo são sempre acessíveis (onboarding)
    if (isDemoAudio) {
      return true;
    }
    
    // 2. Conteúdo não-premium é acessível para todos autenticados
    if (!isPremium) {
      return true;
    }
    
    // 3. Conteúdo premium requer assinatura ativa
    return subscribed && subscriptionTier !== null;
  }

  /**
   * Retorna o motivo pelo qual o acesso foi negado
   */
  static getAccessDeniedReason(subscribed: boolean, isPremium: boolean): string {
    if (!subscribed && isPremium) {
      return 'Este conteúdo é exclusivo para assinantes. Faça upgrade para acessar.';
    }
    return 'Acesso negado.';
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

