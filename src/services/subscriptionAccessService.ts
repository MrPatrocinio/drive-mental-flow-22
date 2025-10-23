

import { useCallback, useMemo } from 'react';
import { useSubscription } from '@/hooks/useSubscription';

/**
 * Serviço responsável por verificar acesso baseado em assinatura
 * Princípio SRP: Uma única responsabilidade - verificar acesso
 * SEGURANÇA: Implementa verificação de assinatura para conteúdo premium
 */
export class SubscriptionAccessService {
  /**
   * 🔥 FASE 2: Verifica se o status representa assinatura ativa
   */
  static isActiveStatus(status?: string): boolean {
    return status === 'active' || status === 'trialing';
  }

  /**
   * Verifica se o usuário tem acesso completo (assinatura ativa)
   */
  static hasFullAccess(subscribed: boolean, subscriptionTier: string | null, status?: string): boolean {
    // 🔥 FASE 2: Priorizar status detalhado se disponível
    if (status) {
      return this.isActiveStatus(status) && subscriptionTier !== null;
    }
    // Fallback para subscribed (backward compatibility)
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
    isDemoAudio: boolean = false,
    status?: string // 🔥 FASE 2
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
    // 🔥 FASE 2: Priorizar status detalhado
    if (status) {
      return this.isActiveStatus(status) && subscriptionTier !== null;
    }
    return subscribed && subscriptionTier !== null;
  }

  /**
   * Retorna o motivo pelo qual o acesso foi negado
   */
  static getAccessDeniedReason(subscribed: boolean, isPremium: boolean, status?: string): string {
    const isActive = status ? this.isActiveStatus(status) : subscribed;
    
    if (!isActive && isPremium) {
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
  const { subscribed, subscription_tier, subscription_status } = useSubscription();

  // Memoizar verificações para evitar recriações
  const hasFullAccess = useMemo(() => {
    return SubscriptionAccessService.hasFullAccess(subscribed, subscription_tier, subscription_status);
  }, [subscribed, subscription_tier, subscription_status]);

  const hasActiveSubscription = useMemo(() => {
    // 🔥 FASE 2: Usar status detalhado
    if (subscription_status) {
      return SubscriptionAccessService.isActiveStatus(subscription_status) && subscription_tier !== null;
    }
    return subscribed && subscription_tier !== null;
  }, [subscribed, subscription_tier, subscription_status]);

  // Função estável com useCallback
  const canAccessAudio = useCallback((isPremium: boolean = false, isDemoAudio: boolean = false) => {
    return SubscriptionAccessService.canAccessAudio(subscribed, subscription_tier, isPremium, isDemoAudio, subscription_status);
  }, [subscribed, subscription_tier, subscription_status]);

  const getAccessDeniedReason = useCallback((isPremium: boolean = false) => {
    return SubscriptionAccessService.getAccessDeniedReason(subscribed, isPremium, subscription_status);
  }, [subscribed, subscription_status]);

  return {
    hasFullAccess,
    canAccessAudio,
    getAccessDeniedReason,
    subscribed,
    subscription_tier,
    subscription_status, // 🔥 FASE 2: Expor status detalhado
    hasActiveSubscription
  };
};

