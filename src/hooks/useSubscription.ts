
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SubscriptionCacheService } from '@/services/subscriptionCacheService';
import { DebounceService } from '@/services/debounceService';
import { NavigationService } from '@/services/navigationService';

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  subscription_status?: string; // 🔥 FASE 2: Status detalhado do Stripe
}

export const useSubscription = () => {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
    subscription_status: 'none', // 🔥 FASE 2: Status padrão
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  
  // Controle para evitar múltiplas chamadas simultâneas
  const isCheckingRef = useRef(false);

  const checkSubscription = useCallback(async () => {
    // Evita múltiplas chamadas simultâneas
    if (isCheckingRef.current) {
      console.log('[SUBSCRIPTION] Verificação já em andamento, ignorando');
      return;
    }

    // Primeiro tenta cache local
    const cachedData = SubscriptionCacheService.getFromCache();
    if (cachedData) {
      console.log('[SUBSCRIPTION] Usando dados do cache');
      setSubscriptionData({
        subscribed: cachedData.subscribed,
        subscription_tier: cachedData.subscription_tier,
        subscription_end: cachedData.subscription_end,
        subscription_status: cachedData.subscription_status || 'none', // 🔥 FASE 2
      });
      return;
    }

    try {
      isCheckingRef.current = true;
      setIsChecking(true);
      console.log('[SUBSCRIPTION] Verificando assinatura via API...');
      
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('[SUBSCRIPTION] Erro na verificação:', error);
        toast.error('Erro ao verificar assinatura');
        return;
      }

      console.log('[SUBSCRIPTION] Dados recebidos:', data);
      
      // Atualiza estado
      setSubscriptionData(data);
      
      // Salva no cache
      SubscriptionCacheService.setCache(data);
      
    } catch (error) {
      console.error('[SUBSCRIPTION] Erro na verificação:', error);
      toast.error('Erro ao verificar assinatura');
    } finally {
      setIsChecking(false);
      isCheckingRef.current = false;
    }
  }, []);

  // Versão com debounce para evitar chamadas excessivas
  const debouncedCheckSubscription = useCallback(
    DebounceService.debounce('checkSubscription', checkSubscription, 500),
    [checkSubscription]
  );

  const createSubscription = useCallback(async (tier: string = 'premium') => {
    try {
      // Verifica se o usuário está autenticado
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        console.log('[SUBSCRIPTION] Usuário não autenticado, salvando plano escolhido');
        localStorage.setItem('pendingSubscriptionPlan', tier);
        toast.info('Faça login para continuar com a assinatura');
        return { requiresAuth: true };
      }

      setIsLoading(true);
      console.log('[SUBSCRIPTION] Criando checkout...', { tier });
      
      toast.loading('Preparando pagamento seguro...', { id: 'checkout' });
      
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: { plan: tier }
      });
      
      if (error) {
        console.error('[SUBSCRIPTION] Erro ao criar assinatura:', error);
        toast.error('Erro ao criar assinatura', { id: 'checkout' });
        return { requiresAuth: false };
      }

      console.log('[SUBSCRIPTION] Redirecionando para:', data.url);
      
      toast.success('Redirecionando para pagamento...', { 
        id: 'checkout',
        action: {
          label: 'Abrir agora',
          onClick: () => window.open(data.url, '_blank', 'noopener,noreferrer')
        }
      });
      
      setTimeout(() => {
        if (!NavigationService.goToExternal(data.url)) {
          NavigationService.openInNewTab(data.url);
        }
      }, 500);
      
      return { requiresAuth: false };
    } catch (error) {
      console.error('[SUBSCRIPTION] Erro ao criar assinatura:', error);
      toast.error('Erro ao criar assinatura. Tente novamente.', { id: 'checkout' });
      return { requiresAuth: false };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openCustomerPortal = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('[SUBSCRIPTION] Abrindo portal do cliente...');
      
      toast.loading('Abrindo portal de gerenciamento...', { id: 'portal' });
      
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) {
        console.error('[SUBSCRIPTION] Erro ao abrir portal:', error);
        toast.error('Erro ao abrir portal do cliente', { id: 'portal' });
        return;
      }

      console.log('[SUBSCRIPTION] Redirecionando para portal:', data.url);
      toast.success('Redirecionando...', { 
        id: 'portal',
        action: {
          label: 'Abrir agora',
          onClick: () => window.open(data.url, '_blank', 'noopener,noreferrer')
        }
      });
      
      setTimeout(() => {
        if (!NavigationService.goToExternal(data.url)) {
          NavigationService.openInNewTab(data.url);
        }
      }, 500);
    } catch (error) {
      console.error('[SUBSCRIPTION] Erro ao abrir portal:', error);
      toast.error('Erro ao abrir portal do cliente', { id: 'portal' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Verifica assinatura apenas quando necessário
  useEffect(() => {
    const checkOnAuthChange = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        debouncedCheckSubscription();
      } else {
        // Limpa cache quando usuário sai
        SubscriptionCacheService.clearCache();
      }
    };

    checkOnAuthChange();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        debouncedCheckSubscription();
      } else if (event === 'SIGNED_OUT') {
        SubscriptionCacheService.clearCache();
        setSubscriptionData({
          subscribed: false,
          subscription_tier: null,
          subscription_end: null,
          subscription_status: 'none', // 🔥 FASE 2
        });
      }
    });

    return () => {
      subscription.unsubscribe();
      DebounceService.cancel('checkSubscription');
    };
  }, [debouncedCheckSubscription]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      DebounceService.cancel('checkSubscription');
      isCheckingRef.current = false;
    };
  }, []);

  return {
    ...subscriptionData,
    isLoading,
    isChecking,
    checkSubscription: debouncedCheckSubscription,
    createSubscription,
    openCustomerPortal,
  };
};
