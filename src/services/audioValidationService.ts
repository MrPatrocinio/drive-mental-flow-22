
/**
 * AudioValidationService - Serviço para validar URLs de áudio
 * Responsabilidade: Verificar se URLs de áudio são válidas e acessíveis
 * Princípio SRP: Apenas validação de áudio
 */

export interface AudioValidationResult {
  isValid: boolean;
  error?: string;
  canPlay: boolean;
  duration?: number;
}

export class AudioValidationService {
  /**
   * Valida se uma URL de áudio é acessível e pode ser reproduzida
   */
  static async validateAudioUrl(url: string): Promise<AudioValidationResult> {
    try {
      console.log('AudioValidationService: Validando URL:', url);

      // Verificar se URL é válida
      if (!url || typeof url !== 'string') {
        return {
          isValid: false,
          error: 'URL inválida ou não fornecida',
          canPlay: false
        };
      }

      // Criar elemento de áudio temporário para teste
      const audio = new Audio();
      
      return new Promise<AudioValidationResult>((resolve) => {
        const timeout = setTimeout(() => {
          audio.src = '';
          resolve({
            isValid: false,
            error: 'Timeout ao carregar áudio - verifique sua conexão',
            canPlay: false
          });
        }, 10000); // 10 segundos de timeout

        audio.addEventListener('loadedmetadata', () => {
          clearTimeout(timeout);
          console.log('AudioValidationService: Áudio validado com sucesso');
          resolve({
            isValid: true,
            canPlay: true,
            duration: audio.duration
          });
        });

        audio.addEventListener('error', (e) => {
          clearTimeout(timeout);
          const error = this.getAudioErrorMessage(audio.error);
          console.error('AudioValidationService: Erro na validação:', error);
          resolve({
            isValid: false,
            error,
            canPlay: false
          });
        });

        // Configurar CORS e carregar
        audio.crossOrigin = 'anonymous';
        audio.preload = 'metadata';
        audio.src = url;
      });

    } catch (error) {
      console.error('AudioValidationService: Erro inesperado:', error);
      return {
        isValid: false,
        error: 'Erro inesperado ao validar áudio',
        canPlay: false
      };
    }
  }

  /**
   * Converte códigos de erro em mensagens legíveis
   */
  private static getAudioErrorMessage(error: MediaError | null): string {
    if (!error) return 'Erro desconhecido';

    switch (error.code) {
      case MediaError.MEDIA_ERR_ABORTED:
        return 'Carregamento cancelado';
      case MediaError.MEDIA_ERR_NETWORK:
        return 'Erro de rede - verifique sua conexão';
      case MediaError.MEDIA_ERR_DECODE:
        return 'Arquivo de áudio corrompido ou formato inválido';
      case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
        return 'Arquivo não encontrado ou formato não suportado';
      default:
        return 'Erro desconhecido na reprodução';
    }
  }

  /**
   * Testa conectividade básica com o Supabase Storage
   */
  static async testStorageConnectivity(): Promise<boolean> {
    try {
      const testUrl = 'https://ipdzkzlrcyrcfwvhiulc.supabase.co/storage/v1/object/public/audios/';
      const response = await fetch(testUrl, { method: 'HEAD' });
      return response.ok || response.status === 404; // 404 é ok, significa que chegou no storage
    } catch (error) {
      console.error('AudioValidationService: Erro ao testar conectividade:', error);
      return false;
    }
  }
}
