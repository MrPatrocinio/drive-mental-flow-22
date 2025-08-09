
/**
 * VideoUploadService - Serviço para upload de vídeos no Supabase Storage
 * Responsabilidade: Upload e gerenciamento de vídeos locais
 * Princípio SRP: Apenas operações de upload de vídeo
 * Princípio SSOT: Fonte única da verdade para uploads de vídeo
 */

import { supabase } from '@/integrations/supabase/client';

export interface VideoUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface VideoUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export class VideoUploadService {
  /**
   * Valida arquivo de vídeo antes do upload
   */
  static validateVideoFile(file: File): { isValid: boolean; error?: string } {
    // Verificar tipo de arquivo
    const allowedTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Formato de vídeo não suportado. Use MP4, MPEG, MOV, AVI ou WebM.'
      };
    }

    // Verificar tamanho (50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB em bytes
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `Arquivo muito grande. Tamanho máximo: 50MB. Tamanho atual: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
      };
    }

    return { isValid: true };
  }

  /**
   * Faz upload de vídeo para o Storage
   */
  static async uploadVideo(
    file: File,
    onProgress?: (progress: VideoUploadProgress) => void
  ): Promise<VideoUploadResult> {
    try {
      console.log('VideoUploadService: Iniciando upload de vídeo');

      // Validar arquivo
      const validation = this.validateVideoFile(file);
      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }

      // Gerar nome único para o arquivo
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `video_${timestamp}.${fileExtension}`;

      // Upload com progress callback (simulado - Supabase não suporta progress nativo)
      if (onProgress) {
        onProgress({ loaded: 0, total: file.size, percentage: 0 });
        
        // Simular progresso durante o upload
        const progressInterval = setInterval(() => {
          const randomProgress = Math.min(90, Math.random() * 80 + 10);
          onProgress({
            loaded: Math.floor((file.size * randomProgress) / 100),
            total: file.size,
            percentage: randomProgress
          });
        }, 500);

        // Realizar upload
        const { data, error } = await supabase.storage
          .from('videos')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        clearInterval(progressInterval);

        if (error) throw error;

        // Progresso final
        onProgress({ loaded: file.size, total: file.size, percentage: 100 });

        // Obter URL pública
        const { data: urlData } = supabase.storage
          .from('videos')
          .getPublicUrl(fileName);

        console.log('VideoUploadService: Upload concluído com sucesso');
        return { success: true, url: urlData.publicUrl };
      } else {
        // Upload sem callback de progresso
        const { data, error } = await supabase.storage
          .from('videos')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from('videos')
          .getPublicUrl(fileName);

        return { success: true, url: urlData.publicUrl };
      }
    } catch (error) {
      console.error('VideoUploadService: Erro no upload:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido no upload' 
      };
    }
  }

  /**
   * Remove vídeo do Storage
   */
  static async deleteVideo(videoUrl: string): Promise<boolean> {
    try {
      // Extrair nome do arquivo da URL
      const fileName = this.extractFileNameFromUrl(videoUrl);
      if (!fileName) return false;

      console.log('VideoUploadService: Removendo vídeo do storage');
      const { error } = await supabase.storage
        .from('videos')
        .remove([fileName]);

      if (error) throw error;

      console.log('VideoUploadService: Vídeo removido com sucesso');
      return true;
    } catch (error) {
      console.error('VideoUploadService: Erro ao remover vídeo:', error);
      return false;
    }
  }

  /**
   * Extrai nome do arquivo da URL do Supabase Storage
   */
  private static extractFileNameFromUrl(url: string): string | null {
    try {
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      return fileName || null;
    } catch (error) {
      console.error('VideoUploadService: Erro ao extrair nome do arquivo:', error);
      return null;
    }
  }

  /**
   * Verifica se a URL é do Supabase Storage
   */
  static isSupabaseStorageUrl(url: string): boolean {
    return url.includes('supabase.co/storage/v1/object/public/videos/');
  }

  /**
   * Gera thumbnail do vídeo (para implementação futura)
   */
  static async generateThumbnail(file: File): Promise<string | null> {
    try {
      return new Promise((resolve) => {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        video.addEventListener('loadedmetadata', () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          video.currentTime = 1; // Capturar frame em 1 segundo
        });

        video.addEventListener('seeked', () => {
          if (ctx) {
            ctx.drawImage(video, 0, 0);
            const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
            resolve(thumbnail);
          } else {
            resolve(null);
          }
        });

        video.src = URL.createObjectURL(file);
      });
    } catch (error) {
      console.error('VideoUploadService: Erro ao gerar thumbnail:', error);
      return null;
    }
  }
}
