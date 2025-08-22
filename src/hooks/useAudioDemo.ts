
/**
 * Hook para gerenciar operações de áudio demo
 * Responsabilidade: Lógica de estado e operações de demo
 * Princípio SRP: Apenas lógica relacionada a demo de áudios
 */

import { useState, useCallback } from 'react';
import { AudioDemoManagementService } from '@/services/audioDemoManagementService';
import { toast } from 'sonner';

export const useAudioDemo = () => {
  const [loading, setLoading] = useState(false);

  const setAsDemo = useCallback(async (audioId: string, audioTitle: string) => {
    setLoading(true);
    try {
      await AudioDemoManagementService.setAsDemo(audioId);
      toast.success(`"${audioTitle}" definido como áudio de demonstração!`);
    } catch (error) {
      console.error('Erro ao definir áudio como demo:', error);
      toast.error('Erro ao definir áudio como demonstração');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeFromDemo = useCallback(async (audioId: string, audioTitle: string) => {
    setLoading(true);
    try {
      await AudioDemoManagementService.removeFromDemo(audioId);
      toast.success(`"${audioTitle}" removido da demonstração!`);
    } catch (error) {
      console.error('Erro ao remover áudio da demo:', error);
      toast.error('Erro ao remover áudio da demonstração');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleDemo = useCallback(async (audioId: string, audioTitle: string, currentIsDemo: boolean) => {
    if (currentIsDemo) {
      await removeFromDemo(audioId, audioTitle);
    } else {
      await setAsDemo(audioId, audioTitle);
    }
  }, [setAsDemo, removeFromDemo]);

  return {
    loading,
    setAsDemo,
    removeFromDemo,
    toggleDemo
  };
};
