
import { useState, useEffect } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { AudioDemoService } from '@/services/audioDemoService';

/**
 * Hook para verificar acesso a áudios
 * Princípio SRP: Responsabilidade única - verificar acesso a áudio
 * Princípio KISS: Implementação simplificada - todos os áudios são acessíveis agora
 */
export const useAudioAccess = (audioId: string, isPremium: boolean = false) => {
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

  // Lógica simplificada: todos os áudios são acessíveis agora
  // Mantém a verificação de assinatura para futuras funcionalidades
  const hasAccess = () => {
    // TODOS os áudios são acessíveis agora - não há mais diferenciação premium
    return true;
  };

  const getAccessDeniedReason = () => {
    // Como todos têm acesso, esta função é mantida para compatibilidade
    return 'Todos os áudios estão disponíveis.';
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
