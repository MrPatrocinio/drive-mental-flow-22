
/**
 * Hook para gerenciar upload de áudios
 * Responsabilidade: Lógica de upload e criação de áudios
 * Princípio SRP: Apenas lógica relacionada a upload de áudios
 */

import { useState, useCallback } from 'react';
import { AudioService, AudioWithFile } from '@/services/supabase/audioService';
import { toast } from 'sonner';

export const useAudioUpload = () => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const uploadAudio = useCallback(async (audioData: AudioWithFile): Promise<boolean> => {
    setLoading(true);
    setErrors([]);
    
    try {
      // Validações básicas
      const validationErrors: string[] = [];
      
      if (!audioData.title?.trim()) {
        validationErrors.push('Título é obrigatório');
      }
      
      if (!audioData.duration?.trim()) {
        validationErrors.push('Duração é obrigatória');
      }
      
      if (!audioData.field_id?.trim()) {
        validationErrors.push('Campo é obrigatório');
      }
      
      if (!audioData.file) {
        validationErrors.push('Arquivo de áudio é obrigatório');
      }
      
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return false;
      }

      // TODO: Implementar upload do arquivo para storage
      // Por enquanto, usar URL mock para teste
      const mockUrl = `https://example.com/audio/${audioData.file!.name}`;
      
      await AudioService.create({
        title: audioData.title,
        duration: audioData.duration,
        field_id: audioData.field_id,
        url: mockUrl,
        tags: audioData.tags || [],
        is_demo: audioData.is_demo || false
      });

      toast.success(`Áudio "${audioData.title}" criado com sucesso!`);
      return true;
    } catch (error) {
      console.error('Erro ao fazer upload do áudio:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setErrors([`Erro ao criar áudio: ${errorMessage}`]);
      toast.error('Erro ao criar áudio');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return {
    loading,
    errors,
    uploadAudio,
    resetErrors
  };
};
