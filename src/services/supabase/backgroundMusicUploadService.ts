/**
 * Background Music Upload Service
 * Responsabilidade: Upload de arquivos de música de fundo para Supabase Storage
 * Princípio SRP: Apenas upload e gerenciamento de arquivos
 */

import { supabase } from '@/integrations/supabase/client';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export class BackgroundMusicUploadService {
  private static readonly BUCKET_NAME = 'audios';
  private static readonly FOLDER = 'background-music';
  private static readonly ALLOWED_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
  private static readonly MAX_SIZE = 50 * 1024 * 1024; // 50MB

  static validateFile(file: File): string | null {
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return 'Tipo de arquivo não suportado. Use MP3, WAV ou OGG.';
    }

    if (file.size > this.MAX_SIZE) {
      return 'Arquivo muito grande. Máximo 50MB.';
    }

    return null;
  }

  static async uploadFile(
    file: File,
    filename: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    const validation = this.validateFile(file);
    if (validation) {
      throw new Error(validation);
    }

    const fileExt = file.name.split('.').pop();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9-_]/g, '_');
    const filePath = `${this.FOLDER}/${Date.now()}_${sanitizedFilename}.${fileExt}`;

    // Simular progresso para UX (Supabase não fornece progress nativo)
    if (onProgress) {
      const interval = setInterval(() => {
        onProgress({
          loaded: file.size * 0.5,
          total: file.size,
          percentage: 50
        });
      }, 100);

      setTimeout(() => clearInterval(interval), 500);
    }

    const { data, error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Erro no upload: ${error.message}`);
    }

    if (onProgress) {
      onProgress({
        loaded: file.size,
        total: file.size,
        percentage: 100
      });
    }

    return this.getPublicUrl(data.path);
  }

  static getPublicUrl(filePath: string): string {
    const { data } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  static async deleteFile(fileUrl: string): Promise<void> {
    // Extrair o path do arquivo da URL
    const urlParts = fileUrl.split('/');
    const bucketIndex = urlParts.indexOf(this.BUCKET_NAME);
    
    if (bucketIndex === -1) {
      throw new Error('URL inválida para arquivo do bucket');
    }

    const filePath = urlParts.slice(bucketIndex + 1).join('/');

    const { error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      throw new Error(`Erro ao deletar arquivo: ${error.message}`);
    }
  }

  static extractFilenameFromUrl(url: string): string {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return filename.replace(/^\d+_/, ''); // Remove timestamp prefix
  }
}