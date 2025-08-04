/**
 * Serviço responsável pelo cache de áudios no IndexedDB
 * Segue o princípio SRP: apenas gerenciamento de cache offline
 */

export interface OfflineAudio {
  id: string;
  title: string;
  fieldId: string;
  audioBlob: Blob;
  metadata: {
    duration: string;
    size: number;
    url: string;
  };
  downloadedAt: Date;
  lastAccessedAt: Date;
}

export interface CacheStats {
  totalSize: number;
  audioCount: number;
  availableSpace: number;
  usedPercentage: number;
}

export class OfflineCacheService {
  private static readonly DB_NAME = 'DriveAudioCache';
  private static readonly DB_VERSION = 1;
  private static readonly STORE_NAME = 'audios';
  private static readonly MAX_CACHE_SIZE = 500 * 1024 * 1024; // 500MB

  /**
   * Inicializa o banco IndexedDB
   */
  private static async initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
          store.createIndex('fieldId', 'fieldId', { unique: false });
          store.createIndex('downloadedAt', 'downloadedAt', { unique: false });
        }
      };
    });
  }

  /**
   * Baixa e armazena um áudio no cache
   */
  static async downloadAudio(audioId: string, audioUrl: string, metadata: any): Promise<void> {
    try {
      // Verifica espaço disponível
      const stats = await this.getCacheStats();
      if (stats.usedPercentage > 90) {
        await this.cleanOldestAudios(3);
      }

      // Download do áudio
      const response = await fetch(audioUrl);
      if (!response.ok) {
        throw new Error(`Erro ao baixar áudio: ${response.statusText}`);
      }

      const audioBlob = await response.blob();
      
      const offlineAudio: OfflineAudio = {
        id: audioId,
        title: metadata.title,
        fieldId: metadata.fieldId,
        audioBlob,
        metadata: {
          duration: metadata.duration,
          size: audioBlob.size,
          url: audioUrl
        },
        downloadedAt: new Date(),
        lastAccessedAt: new Date()
      };

      const db = await this.initDB();
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      
      await new Promise<void>((resolve, reject) => {
        const request = store.put(offlineAudio);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      console.log(`Áudio ${audioId} baixado e armazenado no cache`);
    } catch (error) {
      console.error('Erro ao baixar áudio:', error);
      throw error;
    }
  }

  /**
   * Recupera um áudio do cache
   */
  static async getAudio(audioId: string): Promise<OfflineAudio | null> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);

      const audio = await new Promise<OfflineAudio | null>((resolve, reject) => {
        const request = store.get(audioId);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });

      if (audio) {
        // Atualiza último acesso
        audio.lastAccessedAt = new Date();
        store.put(audio);
      }

      return audio;
    } catch (error) {
      console.error('Erro ao recuperar áudio:', error);
      return null;
    }
  }

  /**
   * Lista todos os áudios em cache
   */
  static async getAllAudios(): Promise<OfflineAudio[]> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);

      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Erro ao listar áudios:', error);
      return [];
    }
  }

  /**
   * Remove um áudio do cache
   */
  static async removeAudio(audioId: string): Promise<void> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);

      await new Promise<void>((resolve, reject) => {
        const request = store.delete(audioId);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      console.log(`Áudio ${audioId} removido do cache`);
    } catch (error) {
      console.error('Erro ao remover áudio:', error);
      throw error;
    }
  }

  /**
   * Verifica se um áudio está em cache
   */
  static async isAudioCached(audioId: string): Promise<boolean> {
    try {
      const audio = await this.getAudio(audioId);
      return audio !== null;
    } catch {
      return false;
    }
  }

  /**
   * Obtém estatísticas do cache
   */
  static async getCacheStats(): Promise<CacheStats> {
    try {
      const audios = await this.getAllAudios();
      const totalSize = audios.reduce((sum, audio) => sum + audio.metadata.size, 0);
      
      return {
        totalSize,
        audioCount: audios.length,
        availableSpace: this.MAX_CACHE_SIZE - totalSize,
        usedPercentage: (totalSize / this.MAX_CACHE_SIZE) * 100
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return {
        totalSize: 0,
        audioCount: 0,
        availableSpace: this.MAX_CACHE_SIZE,
        usedPercentage: 0
      };
    }
  }

  /**
   * Remove áudios mais antigos para liberar espaço
   */
  private static async cleanOldestAudios(count: number): Promise<void> {
    try {
      const audios = await this.getAllAudios();
      const sortedByAccess = audios.sort((a, b) => 
        new Date(a.lastAccessedAt).getTime() - new Date(b.lastAccessedAt).getTime()
      );

      const toRemove = sortedByAccess.slice(0, count);
      
      for (const audio of toRemove) {
        await this.removeAudio(audio.id);
      }

      console.log(`${count} áudios antigos removidos do cache`);
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
    }
  }

  /**
   * Limpa todo o cache
   */
  static async clearAll(): Promise<void> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);

      await new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      console.log('Cache limpo completamente');
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      throw error;
    }
  }

  /**
   * Cria URL temporária para áudio em cache
   */
  static createBlobUrl(audioBlob: Blob): string {
    return URL.createObjectURL(audioBlob);
  }

  /**
   * Revoga URL temporária
   */
  static revokeBlobUrl(url: string): void {
    URL.revokeObjectURL(url);
  }
}