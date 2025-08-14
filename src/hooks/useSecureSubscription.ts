
/**
 * Hook seguro para gerenciamento de assinaturas
 * Responsabilidade: Interface React para serviço de assinaturas seguro
 * Princípios: SRP (uma responsabilidade), DRY (reutilização), KISS (simples)
 * Simplificado para plano anual único
 */

import { useState, useEffect, useCallback } from 'react';
import { SecureSubscriptionService, type SubscriptionData } from '@/services/secureSubscriptionService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSecureSubscription = () => {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  /**
   * Verifica assinatura usando serviço seguro
   * Princípio SRP: Uma responsabilidade - verificar assinatura
   */
  const checkSubscription = useCallback(async () => {
    try {
      setIsChecking(true);
      console.log('[SECURE_SUBSCRIPTION] Verificando assinatura...');
      
      const { data, error } = await SecureSubscriptionService.getCurrentUserSubscription();
      
      if (error) {
        console.error('[SECURE_SUBSCRIPTION] Erro:', error);
        toast.error('Erro ao verificar assinatura');
        return;
      }

      if (data) {
        console.log('[SECURE_SUBSCRIPTION] Dados recebidos:', data);
        setSubscriptionData(data);
      }
    } catch (error) {
      console.error('[SECURE_SUBSCRIPTION] Erro na verificação:', error);
      toast.error('Erro ao verificar assinatura');
    } finally {
      setIsChecking(false);
    }
  }, []);

  /**
   * Cria assinatura usando Edge Function (segura)
   * Princípio KISS: Implementação simples para plano único
   * Sempre cria assinatura anual (não precisa mais de parâmetro tier)
   */
  const createSubscription = useCallback(async (tier: string = 'annual') => {
    try {
      setIsLoading(true);
      console.log('[SECURE_SUBSCRIPTION] Criando checkout anual...');
      
      // Edge Function já tem acesso service_role - seguro
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: {} // Não precisa enviar tier, sempre será anual
      });
      
      if (error) {
        console.error('[SECURE_SUBSCRIPTION] Erro no checkout:', error);
        toast.error('Erro ao criar assinatura');
        return;
      }

      console.log('[SECURE_SUBSCRIPTION] Redirecionando:', data.url);
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('[SECURE_SUBSCRIPTION] Erro geral:', error);
      toast.error('Erro ao criar assinatura');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Abre portal do cliente usando Edge Function (segura)
   */
  const openCustomerPortal = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('[SECURE_SUBSCRIPTION] Abrindo portal...');
      
      // Edge Function já tem acesso service_role - seguro
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) {
        console.error('[SECURE_SUBSCRIPTION] Erro no portal:', error);
        toast.error('Erro ao abrir portal do cliente');
        return;
      }

      console.log('[SECURE_SUBSCRIPTION] Portal:', data.url);
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('[SECURE_SUBSCRIPTION] Erro no portal:', error);
      toast.error('Erro ao abrir portal do cliente');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Verificar assinatura em mudanças de auth
  useEffect(() => {
    const checkOnAuthChange = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await checkSubscription();
      }
    };

    checkOnAuthChange();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await checkSubscription();
      } else if (event === 'SIGNED_OUT') {
        setSubscriptionData({
          subscribed: false,
          subscription_tier: null,
          subscription_end: null,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [checkSubscription]);

  return {
    ...subscriptionData,
    isLoading,
    isChecking,
    checkSubscription,
    createSubscription,
    openCustomerPortal,
  };
};
