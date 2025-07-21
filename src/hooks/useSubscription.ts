import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
}

export const useSubscription = () => {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const checkSubscription = useCallback(async () => {
    try {
      setIsChecking(true);
      console.log('[SUBSCRIPTION] Checking subscription status...');
      
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('[SUBSCRIPTION] Error checking subscription:', error);
        toast.error('Erro ao verificar assinatura');
        return;
      }

      console.log('[SUBSCRIPTION] Subscription data received:', data);
      setSubscriptionData(data);
    } catch (error) {
      console.error('[SUBSCRIPTION] Error in checkSubscription:', error);
      toast.error('Erro ao verificar assinatura');
    } finally {
      setIsChecking(false);
    }
  }, []);

  const createSubscription = useCallback(async (tier: string = 'premium') => {
    try {
      setIsLoading(true);
      console.log('[SUBSCRIPTION] Creating subscription checkout...', { tier });
      
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: { tier }
      });
      
      if (error) {
        console.error('[SUBSCRIPTION] Error creating subscription:', error);
        toast.error('Erro ao criar assinatura');
        return;
      }

      console.log('[SUBSCRIPTION] Redirecting to:', data.url);
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('[SUBSCRIPTION] Error in createSubscription:', error);
      toast.error('Erro ao criar assinatura');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openCustomerPortal = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('[SUBSCRIPTION] Opening customer portal...');
      
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) {
        console.error('[SUBSCRIPTION] Error opening customer portal:', error);
        toast.error('Erro ao abrir portal do cliente');
        return;
      }

      console.log('[SUBSCRIPTION] Redirecting to customer portal:', data.url);
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('[SUBSCRIPTION] Error in openCustomerPortal:', error);
      toast.error('Erro ao abrir portal do cliente');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check subscription status on mount and when user authentication changes
  useEffect(() => {
    const checkOnAuthChange = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        checkSubscription();
      }
    };

    checkOnAuthChange();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        checkSubscription();
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