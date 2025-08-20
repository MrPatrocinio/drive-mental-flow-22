
/**
 * AudioValidationService - Serviço para validação de áudios
 * Responsabilidade: Validar URLs de áudio e conectividade
 * Princípio SRP: Apenas validação de áudio
 */

export interface AudioValidationResult {
  isValid: boolean;
  error?: string;
  statusCode?: number;
}

export interface StorageValidationResult {
  isValid: boolean;
  corsConfigured: boolean;
  bucketAccessible: boolean;
  error?: string;
}

export class AudioValidationService {
  /**
   * Valida se uma URL de áudio é acessível e válida
   */
  static async validateAudioUrl(url: string): Promise<AudioValidationResult> {
    try {
      console.log('AudioValidationService: Validando URL:', url);

      // Verifica se a URL é válida
      let validUrl: URL;
      try {
        validUrl = new URL(url);
      } catch {
        return {
          isValid: false,
          error: 'URL inválida'
        };
      }

      // Testa conectividade com a URL
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      try {
        const response = await fetch(url, {
          method: 'HEAD',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          return {
            isValid: false,
            error: `Erro HTTP ${response.status}`,
            statusCode: response.status
          };
        }

        // Verifica se é um arquivo de áudio
        const contentType = response.headers.get('content-type');
        if (contentType && !contentType.startsWith('audio/')) {
          console.warn('AudioValidationService: Tipo de conteúdo não é áudio:', contentType);
        }

        console.log('AudioValidationService: Áudio validado com sucesso');
        return { isValid: true };

      } catch (error) {
        clearTimeout(timeoutId);
        
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            return {
              isValid: false,
              error: 'Timeout na validação do áudio'
            };
          }
          
          return {
            isValid: false,
            error: `Erro de rede: ${error.message}`
          };
        }

        return {
          isValid: false,
          error: 'Erro desconhecido na validação'
        };
      }
    } catch (error) {
      console.error('AudioValidationService: Erro na validação:', error);
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Testa conectividade básica com o Supabase
   */
  static async testSupabaseConnectivity(): Promise<AudioValidationResult> {
    try {
      console.log('AudioValidationService: Testando conectividade com Supabase');
      
      const supabaseUrl = 'https://ipdzkzlrcyrcfwvhiulc.supabase.co';
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'HEAD',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwZHpremxyY3lyY2Z3dmhpdWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTU4NDAsImV4cCI6MjA2ODI5MTg0MH0.Hwao9dFvdMEy8QDUzVosDtCEDWjqty5R8ZVkMPMUIAI'
        }
      });

      if (response.ok) {
        console.log('AudioValidationService: Conectividade com Supabase OK');
        return { isValid: true };
      } else {
        return {
          isValid: false,
          error: `Erro de conectividade: ${response.status}`,
          statusCode: response.status
        };
      }
    } catch (error) {
      console.error('AudioValidationService: Erro de conectividade:', error);
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Erro de conectividade'
      };
    }
  }

  /**
   * Valida configuração do storage (para AdminDiagnostics)
   */
  static async validateStorageConfiguration(): Promise<StorageValidationResult> {
    try {
      console.log('AudioValidationService: Validando configuração do storage');
      
      // Testa acesso ao bucket de audios
      const testUrl = 'https://ipdzkzlrcyrcfwvhiulc.supabase.co/storage/v1/object/public/audios/';
      
      const response = await fetch(testUrl, { method: 'HEAD' });
      
      return {
        isValid: response.ok,
        corsConfigured: true, // Assumimos que CORS está configurado se chegou até aqui
        bucketAccessible: response.ok,
        error: response.ok ? undefined : `Bucket não acessível: ${response.status}`
      };
    } catch (error) {
      return {
        isValid: false,
        corsConfigured: false,
        bucketAccessible: false,
        error: error instanceof Error ? error.message : 'Erro de validação do storage'
      };
    }
  }

  /**
   * Encontra áudios inválidos (para AdminDiagnostics)
   * Retorna objetos com id, url, error e title conforme esperado pelo tipo InvalidAudio
   */
  static async findInvalidAudios(): Promise<{ id: string; url: string; error: string; title: string }[]> {
    try {
      // Esta função seria implementada com acesso ao banco de dados
      // Por agora, retorna array vazio
      console.log('AudioValidationService: Buscando áudios inválidos (não implementado)');
      return [];
    } catch (error) {
      console.error('AudioValidationService: Erro ao buscar áudios inválidos:', error);
      return [];
    }
  }
}
