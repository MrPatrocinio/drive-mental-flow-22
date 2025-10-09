/**
 * Serviço coordenador para funcionalidades de áudio offline
 * Segue o princípio SRP: coordenação de operações offline
 */

import { OfflineCacheService, type OfflineAudio, type CacheStats } from './offlineCacheService';
import { OfflineStatusService, type ConnectionInfo } from './offlineStatusService';

export interface DownloadProgress {
  audioId: string;
  progress: number; // 0-100
  status: 'queued' | 'downloading' | 'completed' | 'error';
  error?: string;
}

export type DownloadProgressListener = (progress: DownloadProgress) => void;

export class OfflineAudioService {
  private static downloadQueue: Map<string, DownloadProgressListener[]> = new Map();
  private static activeDownloads: Set<string> = new Set();

  /**
   * Inicializa o serviço de áudio offline
   */
  static initialize(): void {
    OfflineStatusService.initialize();
  }

  /**
   * Inicia o download de um áudio
   */
  static async downloadAudio(
    audioId: string, 
    audioUrl: string, 
    metadata: any,
    onProgress?: DownloadProgressListener
  ): Promise<void> {
    try {
      // Verifica se já está baixado
      const isAlreadyCached = await OfflineCacheService.isAudioCached(audioId);
      if (isAlreadyCached) {
        onProgress?.({
          audioId,
          progress: 100,
          status: 'completed'
        });
        return;
      }

      // Verifica se já está sendo baixado
      if (this.activeDownloads.has(audioId)) {
        if (onProgress) {
          const listeners = this.downloadQueue.get(audioId) || [];
          listeners.push(onProgress);
          this.downloadQueue.set(audioId, listeners);
        }
        return;
      }

      // Inicia download
      this.activeDownloads.add(audioId);
      const listeners = onProgress ? [onProgress] : [];
      this.downloadQueue.set(audioId, listeners);

      this.notifyProgress(audioId, 0, 'downloading');

      // Verifica conectividade
      const connectionInfo = OfflineStatusService.getCurrentStatus();
      if (!connectionInfo.isOnline) {
        throw new Error('Sem conexão com a internet');
      }

      // Download com progresso
      const response = await fetch(audioUrl);
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.statusText}`);
      }

      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength) : 0;
      
      if (!response.body) {
        throw new Error('Resposta sem corpo');
      }

      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let loaded = 0;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        loaded += value.length;

        if (total > 0) {
          const progress = Math.round((loaded / total) * 100);
          this.notifyProgress(audioId, progress, 'downloading');
        }
      }

      // Reconstrói o blob
      const audioBlob = new Blob(chunks as BlobPart[], { type: response.headers.get('content-type') || 'audio/mpeg' });
      
      // Armazena no cache
      await OfflineCacheService.downloadAudio(audioId, audioUrl, {
        ...metadata,
        size: audioBlob.size
      });

      this.notifyProgress(audioId, 100, 'completed');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error(`Erro ao baixar áudio ${audioId}:`, error);
      
      this.notifyProgress(audioId, 0, 'error', errorMessage);
      throw error;
    } finally {
      this.activeDownloads.delete(audioId);
      this.downloadQueue.delete(audioId);
    }
  }

  /**
   * Remove um áudio do cache offline
   */
  static async removeOfflineAudio(audioId: string): Promise<void> {
    await OfflineCacheService.removeAudio(audioId);
  }

  /**
   * Obtém URL do áudio (cache ou online)
   */
  static async getAudioUrl(audioId: string, fallbackUrl: string): Promise<string> {
    try {
      const cachedAudio = await OfflineCacheService.getAudio(audioId);
      
      if (cachedAudio) {
        return OfflineCacheService.createBlobUrl(cachedAudio.audioBlob);
      }

      // Verifica conectividade antes de usar URL online
      const connectionInfo = OfflineStatusService.getCurrentStatus();
      if (!connectionInfo.isOnline) {
        throw new Error('Áudio não disponível offline e sem conexão');
      }

      return fallbackUrl;
    } catch (error) {
      console.error('Erro ao obter URL do áudio:', error);
      throw error;
    }
  }

  /**
   * Verifica se um áudio está disponível offline
   */
  static async isAudioAvailableOffline(audioId: string): Promise<boolean> {
    return await OfflineCacheService.isAudioCached(audioId);
  }

  /**
   * Lista todos os áudios disponíveis offline
   */
  static async getOfflineAudios(): Promise<OfflineAudio[]> {
    return await OfflineCacheService.getAllAudios();
  }

  /**
   * Obtém estatísticas do cache
   */
  static async getCacheStats(): Promise<CacheStats> {
    return await OfflineCacheService.getCacheStats();
  }

  /**
   * Limpa todo o cache offline
   */
  static async clearOfflineCache(): Promise<void> {
    await OfflineCacheService.clearAll();
  }

  /**
   * Verifica se há espaço suficiente para download
   */
  static async hasSpaceForDownload(estimatedSize?: number): Promise<boolean> {
    const stats = await this.getCacheStats();
    
    if (!estimatedSize) {
      return stats.usedPercentage < 90;
    }

    return (stats.totalSize + estimatedSize) <= (stats.availableSpace + stats.totalSize);
  }

  /**
   * Obtém status de conectividade atual
   */
  static getConnectionStatus(): ConnectionInfo {
    return OfflineStatusService.getCurrentStatus();
  }

  /**
   * Adiciona listener para mudanças de conectividade
   */
  static onConnectionChange(listener: (info: ConnectionInfo) => void): () => void {
    return OfflineStatusService.addListener(listener);
  }

  /**
   * Verifica se está baixando um áudio específico
   */
  static isDownloading(audioId: string): boolean {
    return this.activeDownloads.has(audioId);
  }

  /**
   * Obtém lista de áudios sendo baixados
   */
  static getActiveDownloads(): string[] {
    return Array.from(this.activeDownloads);
  }

  /**
   * Notifica progresso de download
   */
  private static notifyProgress(
    audioId: string, 
    progress: number, 
    status: DownloadProgress['status'],
    error?: string
  ): void {
    const listeners = this.downloadQueue.get(audioId) || [];
    const progressInfo: DownloadProgress = {
      audioId,
      progress,
      status,
      error
    };

    listeners.forEach(listener => {
      try {
        listener(progressInfo);
      } catch (error) {
        console.error('Erro ao notificar progresso:', error);
      }
    });
  }

  /**
   * Limpa recursos e listeners
   */
  static cleanup(): void {
    OfflineStatusService.cleanup();
    this.downloadQueue.clear();
    this.activeDownloads.clear();
  }
}