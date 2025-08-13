
import { useState, useEffect } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { AudioDemoService } from '@/services/audioDemoService';

/**
 * Hook para verificar acesso a áudios específicos
 * Princípio SRP: Responsabilidade única - verificar acesso a áudio
 * Princípio KISS: Implementação simples e direta
 */
export const useAudioAccess = (audioId: string, isPremium: boolean) => {
  const [isDemoAudio, setIsDemoAudio] = useState(false);
  const [isCheckingDemo, setIsCheckingDemo] = useState(true);
  const { subscribed, subscription_tier } = useSubscription();

  useEffect(() => {
    const checkIfDemo = async () => {
      setIsCheckingDemo(true);
      try {
        const isDemo = await AudioDemoService.isDemoAudio(audioId);
        setIsDemoAudio(isDemo);
      } catch (error) {
        console.error('Erro ao verificar se áudio é demo:', error);
        setIsDemoAudio(false);
      } finally {
        setIsCheckingDemo(false);
      }
    };

    if (audioId) {
      checkIfDemo();
    }
  }, [audioId]);

  // Lógica de acesso simples:
  // 1. Se tem assinatura ativa: acesso total
  // 2. Se não tem assinatura: apenas áudios não-premium ou demo
  const hasAccess = () => {
    // Usuário com assinatura ativa
    if (subscribed && subscription_tier) {
      return true;
    }

    // Usuário sem assinatura: apenas não-premium ou demo
    return !isPremium || isDemoAudio;
  };

  const getAccessDeniedReason = () => {
    if (!subscribed && isPremium && !isDemoAudio) {
      return 'Este conteúdo é exclusivo para assinantes. Faça login e assine para ter acesso completo.';
    }
    return 'Erro na verificação da assinatura.';
  };

  return {
    hasAccess: hasAccess(),
    isDemoAudio,
    isCheckingDemo,
    getAccessDeniedReason: getAccessDeniedReason(),
    subscribed,
    hasActiveSubscription: subscribed && subscription_tier !== null
  };
};
