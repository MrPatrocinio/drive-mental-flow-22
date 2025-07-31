import { supabase } from "@/integrations/supabase/client";

/**
 * Serviço responsável pela validação e verificação de URLs de áudio
 * Segue o princípio SRP: apenas validação de áudios
 */
export class AudioValidationService {
  /**
   * Verifica se uma URL de áudio é válida e acessível
   */
  static async validateAudioUrl(url: string): Promise<{ isValid: boolean; error?: string }> {
    if (!url || url.trim() === '') {
      return { isValid: false, error: 'URL vazia' };
    }

    // Verifica se é URL fictícia (example.com)
    if (url.includes('example.com')) {
      return { isValid: false, error: 'URL fictícia detectada' };
    }

    try {
      // Tenta fazer uma requisição HEAD para verificar se o arquivo existe
      const response = await fetch(url, { method: 'HEAD' });
      
      if (!response.ok) {
        return { isValid: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }

      // Verifica se é um arquivo de áudio
      const contentType = response.headers.get('content-type');
      if (!contentType?.startsWith('audio/')) {
        return { isValid: false, error: 'Arquivo não é do tipo áudio' };
      }

      return { isValid: true };
    } catch (error) {
      return { 
        isValid: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido ao validar URL' 
      };
    }
  }

  /**
   * Identifica áudios com URLs inválidas no banco de dados
   */
  static async findInvalidAudios() {
    const { data: audios, error } = await supabase
      .from('audios')
      .select('id, title, url')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar áudios:', error);
      return [];
    }

    const invalidAudios = [];

    for (const audio of audios || []) {
      const validation = await this.validateAudioUrl(audio.url);
      if (!validation.isValid) {
        invalidAudios.push({
          ...audio,
          validationError: validation.error
        });
      }
    }

    return invalidAudios;
  }

  /**
   * Verifica se o bucket de áudios está configurado corretamente
   */
  static async validateStorageConfiguration(): Promise<{ isValid: boolean; error?: string }> {
    try {
      // Tenta listar arquivos no bucket para verificar se existe e tem permissões
      const { data, error } = await supabase.storage
        .from('audios')
        .list('', { limit: 1 });

      if (error) {
        return { isValid: false, error: `Erro no bucket 'audios': ${error.message}` };
      }

      return { isValid: true };
    } catch (error) {
      return { 
        isValid: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido na verificação do storage' 
      };
    }
  }
}