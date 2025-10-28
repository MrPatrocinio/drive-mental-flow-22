
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
    subscription_status: 'none',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Controle para evitar múltiplas chamadas simultâneas e retry logic
  const isCheckingRef = useRef(false);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  // Função interna com retry logic
  const checkSubscriptionInternal = useCallback(async (isRetry = false) => {
    // Evita múltiplas chamadas simultâneas
    if (isCheckingRef.current) {
      console.log('[SUBSCRIPTION] Verificação já em andamento, ignorando');
      return;
    }

    // Primeiro tenta cache local (exceto em retry)
    if (!isRetry) {
      const cachedData = SubscriptionCacheService.getFromCache();
      if (cachedData) {
        console.log('[SUBSCRIPTION] Usando dados do cache');
        setSubscriptionData({
          subscribed: cachedData.subscribed,
          subscription_tier: cachedData.subscription_tier,
          subscription_end: cachedData.subscription_end,
          subscription_status: cachedData.subscription_status || 'none',
        });
        setIsInitializing(false);
        return;
      }
    }

    try {
      isCheckingRef.current = true;
      setIsChecking(true);
      
      const attemptNumber = isRetry ? retryCountRef.current + 1 : 1;
      console.log(`[SUBSCRIPTION] Verificando assinatura via API (tentativa ${attemptNumber}/${maxRetries})...`);
      
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        throw error;
      }

      console.log('[SUBSCRIPTION] Dados recebidos:', data);
      
      // Sucesso - reseta retry count
      retryCountRef.current = 0;
      
      // Atualiza estado
      setSubscriptionData(data);
      
      // Salva no cache
      SubscriptionCacheService.setCache(data);
      
      setIsInitializing(false);
      
    } catch (error) {
      console.error(`[SUBSCRIPTION] Erro na verificação (tentativa ${retryCountRef.current + 1}/${maxRetries}):`, error);
      
      // Implementa retry com exponential backoff
      if (retryCountRef.current < maxRetries - 1) {
        retryCountRef.current++;
        const delay = Math.pow(2, retryCountRef.current) * 1000; // 1s, 2s, 4s
        
        console.log(`[SUBSCRIPTION] Tentando novamente em ${delay}ms...`);
        
        setTimeout(() => {
          checkSubscriptionInternal(true);
        }, delay);
      } else {
        // Após todas as tentativas, só mostra erro se não for inicialização
        if (!isInitializing) {
          toast.error('Erro ao verificar assinatura. Tente novamente.');
        }
        console.error('[SUBSCRIPTION] Falhou após todas as tentativas de retry');
        retryCountRef.current = 0;
        setIsInitializing(false);
      }
    } finally {
      setIsChecking(false);
      isCheckingRef.current = false;
    }
  }, [isInitializing]);

  // Função pública sem parâmetros (para uso em botões/events)
  const checkSubscription = useCallback(() => {
    checkSubscriptionInternal(false);
  }, [checkSubscriptionInternal]);

  // Versão com debounce para evitar chamadas excessivas
  const debouncedCheckSubscription = useCallback(
    DebounceService.debounce('checkSubscription', checkSubscription, 500),
    [checkSubscription]
  );

  const createSubscription = useCallback(async (planCode: string) => {
    try {
      setIsLoading(true);
      console.log('[SUBSCRIPTION] Criando checkout session para planCode:', planCode);
      
      toast.loading('Preparando pagamento seguro...', { id: 'checkout' });
      
      // Autenticação opcional - permite pay-first flow
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      const session = sessionData?.session ?? null;
      
      if (sessionError) {
        console.warn('[SUBSCRIPTION] Erro ao obter sessão (seguindo como novo usuário):', sessionError);
      }
      
      if (session) {
        console.log('[SUBSCRIPTION] Usuário autenticado, enviando JWT token');
      } else {
        console.log('[SUBSCRIPTION] Usuário novo, iniciando fluxo pay-first');
      }
      
      const headers = session ? { Authorization: `Bearer ${session.access_token}` } : undefined;
      
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: { planCode },
        headers
      });
      
      if (error) {
        console.error('[SUBSCRIPTION] Erro ao criar checkout:', error);
        toast.error('Erro ao criar assinatura', { id: 'checkout' });
        return;
      }

      console.log('[SUBSCRIPTION] Redirecionando para Stripe:', data.url);
      
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
    } catch (error) {
      console.error('[SUBSCRIPTION] Erro ao criar assinatura:', error);
      toast.error('Erro ao criar assinatura. Tente novamente.', { id: 'checkout' });
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
    isInitializing,
    checkSubscription: debouncedCheckSubscription,
    createSubscription,
    openCustomerPortal,
  };
};
