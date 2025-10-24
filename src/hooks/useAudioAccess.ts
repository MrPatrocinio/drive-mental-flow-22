
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

  // ✅ FASE 3: Modelo Paga/Não Paga
  const hasAccess = () => {
    // Demo sempre acessível (landing page)
    if (isDemoAudio) return true;
    
    // Demais áudios: só com assinatura ativa
    return subscribed && subscription_tier !== null;
  };

  const getAccessDeniedReason = () => {
    if (isDemoAudio) return '';
    if (!subscribed) {
      return 'Escolha um plano para acessar todos os áudios.';
    }
    return 'Assinatura inativa.';
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
