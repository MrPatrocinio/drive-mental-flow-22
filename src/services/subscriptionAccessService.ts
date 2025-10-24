

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
   * ✅ FASE 3: Verifica se tem assinatura ativa (acesso total)
   * Modelo simplificado: Paga = Acessa Tudo
   */
  static hasSubscriptionAccess(
    subscribed: boolean,
    subscriptionTier: string | null,
    status?: string
  ): boolean {
    // Priorizar status detalhado se disponível
    if (status) {
      return this.isActiveStatus(status) && subscriptionTier !== null;
    }
    return subscribed && subscriptionTier !== null;
  }
}

/**
 * ✅ FASE 3: Hook simplificado - Modelo Paga/Não Paga
 * Princípio KISS: Lógica simplificada, sem diferenciação premium
 */
export const useContentAccess = () => {
  const { subscribed, subscription_tier, subscription_status } = useSubscription();

  // Verificação simples: tem assinatura ativa?
  const hasSubscriptionAccess = useMemo(() => {
    return SubscriptionAccessService.hasSubscriptionAccess(
      subscribed, 
      subscription_tier, 
      subscription_status
    );
  }, [subscribed, subscription_tier, subscription_status]);

  return {
    hasSubscriptionAccess,
    subscribed,
    subscription_tier,
    subscription_status
  };
};

