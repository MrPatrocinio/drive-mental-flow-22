
/**
 * Hook para verificação de acesso a áudios específicos - versão segura
 * Princípios: SRP, KISS, DRY
 */

import { useState, useEffect } from 'react';
import { useSecureSubscription } from '@/hooks/useSecureSubscription';
import { AudioDemoService } from '@/services/audioDemoService';

/**
 * Hook para verificar acesso a áudios específicos
 * Princípio SRP: Responsabilidade única - verificar acesso a áudio
 * Usando serviços seguros
 */
export const useAudioAccess = (audioId: string, isPremium: boolean) => {
  const [isDemoAudio, setIsDemoAudio] = useState(false);
  const [isCheckingDemo, setIsCheckingDemo] = useState(true);
  const { subscribed, subscription_tier } = useSecureSubscription();

  useEffect(() => {
    const checkIfDemo = async () => {
      setIsCheckingDemo(true);
      try {
        const isDemo = await AudioDemoService.isDemoAudio(audioId);
        setIsDemoAudio(isDemo);
      } catch (error) {
        console.error('[AUDIO_ACCESS] Erro ao verificar demo:', error);
        setIsDemoAudio(false);
      } finally {
        setIsCheckingDemo(false);
      }
    };

    if (audioId) {
      checkIfDemo();
    }
  }, [audioId]);

  /**
   * Lógica de acesso segura
   * Princípio KISS: Implementação simples
   */
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
