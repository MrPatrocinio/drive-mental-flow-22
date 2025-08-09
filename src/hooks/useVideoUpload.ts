
/**
 * useVideoUpload Hook
 * Responsabilidade: Lógica para controle de upload de vídeos
 * Princípio SRP: Apenas lógica de upload de vídeo
 * Princípio DRY: Hook reutilizável para upload de vídeos
 */

import { useState, useCallback } from 'react';
import { VideoUploadService, VideoUploadProgress } from '@/services/supabase/videoUploadService';

interface UseVideoUploadResult {
  isUploading: boolean;
  progress: VideoUploadProgress | null;
  error: string | null;
  uploadVideo: (file: File) => Promise<string | null>;
  reset: () => void;
}

export const useVideoUpload = (): UseVideoUploadResult => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<VideoUploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadVideo = useCallback(async (file: File): Promise<string | null> => {
    setIsUploading(true);
    setError(null);
    setProgress(null);

    try {
      const result = await VideoUploadService.uploadVideo(file, (progressData) => {
        setProgress(progressData);
      });

      if (result.success) {
        return result.url || null;
      } else {
        setError(result.error || 'Erro desconhecido no upload');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(null);
    setError(null);
  }, []);

  return {
    isUploading,
    progress,
    error,
    uploadVideo,
    reset
  };
};
