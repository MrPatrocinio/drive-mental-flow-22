/**
 * Hook para gerenciar áudios offline
 * Segue o princípio SRP: apenas estado e operações de áudio offline
 */

import { useState, useEffect, useCallback } from 'react';
import { OfflineAudioService, type DownloadProgress } from '@/services/offlineAudioService';
import { type OfflineAudio, type CacheStats } from '@/services/offlineCacheService';
import { useToast } from '@/hooks/use-toast';

export function useOfflineAudio(audioId?: string) {
  const [isAvailableOffline, setIsAvailableOffline] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [offlineAudios, setOfflineAudios] = useState<OfflineAudio[]>([]);
  const [cacheStats, setCacheStats] = useState<CacheStats>({
    totalSize: 0,
    audioCount: 0,
    availableSpace: 0,
    usedPercentage: 0
  });
  
  const { toast } = useToast();

  // Verifica se áudio específico está disponível offline
  useEffect(() => {
    if (audioId) {
      checkOfflineAvailability();
      checkDownloadStatus();
    }
  }, [audioId]);

  // Carrega lista de áudios offline e estatísticas
  useEffect(() => {
    loadOfflineData();
  }, []);

  const checkOfflineAvailability = useCallback(async () => {
    if (!audioId) return;
    
    try {
      const available = await OfflineAudioService.isAudioAvailableOffline(audioId);
      setIsAvailableOffline(available);
    } catch (error) {
      console.error('Erro ao verificar disponibilidade offline:', error);
    }
  }, [audioId]);

  const checkDownloadStatus = useCallback(() => {
    if (!audioId) return;
    
    const downloading = OfflineAudioService.isDownloading(audioId);
    setIsDownloading(downloading);
  }, [audioId]);

  const loadOfflineData = useCallback(async () => {
    try {
      const [audios, stats] = await Promise.all([
        OfflineAudioService.getOfflineAudios(),
        OfflineAudioService.getCacheStats()
      ]);
      
      setOfflineAudios(audios);
      setCacheStats(stats);
    } catch (error) {
      console.error('Erro ao carregar dados offline:', error);
    }
  }, []);

  const downloadAudio = useCallback(async (
    targetAudioId: string,
    audioUrl: string,
    metadata: any
  ) => {
    try {
      setIsDownloading(true);
      setDownloadProgress(0);

      await OfflineAudioService.downloadAudio(
        targetAudioId,
        audioUrl,
        metadata,
        (progress: DownloadProgress) => {
          setDownloadProgress(progress.progress);
          
          if (progress.status === 'completed') {
            setIsDownloading(false);
            setIsAvailableOffline(true);
            loadOfflineData();
            
            toast({
              title: "Download concluído",
              description: `${metadata.title} está disponível offline`,
            });
          } else if (progress.status === 'error') {
            setIsDownloading(false);
            
            toast({
              title: "Erro no download",
              description: progress.error || "Não foi possível baixar o áudio",
              variant: "destructive"
            });
          }
        }
      );
    } catch (error) {
      setIsDownloading(false);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro no download",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [toast, loadOfflineData]);

  const removeAudio = useCallback(async (targetAudioId: string) => {
    try {
      await OfflineAudioService.removeOfflineAudio(targetAudioId);
      
      if (targetAudioId === audioId) {
        setIsAvailableOffline(false);
      }
      
      loadOfflineData();
      
      toast({
        title: "Áudio removido",
        description: "Áudio removido do cache offline",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro ao remover",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [audioId, toast, loadOfflineData]);

  const clearCache = useCallback(async () => {
    try {
      await OfflineAudioService.clearOfflineCache();
      
      setIsAvailableOffline(false);
      setOfflineAudios([]);
      setCacheStats({
        totalSize: 0,
        audioCount: 0,
        availableSpace: 0,
        usedPercentage: 0
      });
      
      toast({
        title: "Cache limpo",
        description: "Todos os áudios offline foram removidos",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro ao limpar cache",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [toast]);

  const getAudioUrl = useCallback(async (
    targetAudioId: string,
    fallbackUrl: string
  ): Promise<string> => {
    try {
      return await OfflineAudioService.getAudioUrl(targetAudioId, fallbackUrl);
    } catch (error) {
      console.error('Erro ao obter URL do áudio:', error);
      throw error;
    }
  }, []);

  const refreshData = useCallback(() => {
    if (audioId) {
      checkOfflineAvailability();
      checkDownloadStatus();
    }
    loadOfflineData();
  }, [audioId, checkOfflineAvailability, checkDownloadStatus, loadOfflineData]);

  return {
    // Estado do áudio específico
    isAvailableOffline,
    isDownloading,
    downloadProgress,
    
    // Estado geral
    offlineAudios,
    cacheStats,
    
    // Ações
    downloadAudio,
    removeAudio,
    clearCache,
    getAudioUrl,
    refreshData
  };
}