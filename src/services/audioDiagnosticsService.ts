
/**
 * Audio Diagnostics Service
 * Responsabilidade: Diagnóstico e validação de problemas de áudio
 * Princípio SRP: Apenas lógica de diagnóstico de áudio
 * Princípio SSOT: Fonte única para validações de áudio
 */

export interface AudioDiagnosticResult {
  isValid: boolean;
  error?: string;
  details?: {
    canLoadMetadata: boolean;
    canPlay: boolean;
    hasNetworkIssue: boolean;
    hasCorsIssue: boolean;
    hasAutoplayIssue: boolean;
  };
}

export class AudioDiagnosticsService {
  /**
   * Testa se uma URL de áudio está acessível e reproduzível
   */
  static async testAudioUrl(url: string): Promise<AudioDiagnosticResult> {
    console.log('AudioDiagnosticsService: Testando URL de áudio:', url);
    
    const result: AudioDiagnosticResult = {
      isValid: false,
      details: {
        canLoadMetadata: false,
        canPlay: false,
        hasNetworkIssue: false,
        hasCorsIssue: false,
        hasAutoplayIssue: false
      }
    };

    try {
      // Criar elemento de áudio para teste
      const testAudio = new Audio();
      testAudio.preload = 'metadata';
      
      // Teste de carregamento de metadata
      await new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Timeout ao carregar metadata'));
        }, 10000);

        testAudio.onloadedmetadata = () => {
          clearTimeout(timeoutId);
          result.details!.canLoadMetadata = true;
          console.log('AudioDiagnosticsService: Metadata carregada com sucesso');
          resolve();
        };

        testAudio.onerror = (e) => {
          clearTimeout(timeoutId);
          const error = testAudio.error;
          if (error) {
            switch (error.code) {
              case MediaError.MEDIA_ERR_NETWORK:
                result.details!.hasNetworkIssue = true;
                reject(new Error('Erro de rede'));
                break;
              case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                result.details!.hasCorsIssue = true;
                reject(new Error('Arquivo não suportado ou erro CORS'));
                break;
              default:
                reject(new Error(`Erro de mídia: ${error.code}`));
            }
          } else {
            reject(new Error('Erro desconhecido'));
          }
        };

        testAudio.src = url;
        testAudio.load();
      });

      // Teste de reprodução (sem som)
      testAudio.muted = true;
      testAudio.volume = 0;
      
      try {
        await testAudio.play();
        result.details!.canPlay = true;
        testAudio.pause();
        console.log('AudioDiagnosticsService: Reprodução teste bem-sucedida');
      } catch (playError) {
        if (playError instanceof DOMException && playError.name === 'NotAllowedError') {
          result.details!.hasAutoplayIssue = true;
          result.error = 'Política de autoplay do navegador - interação do usuário necessária';
        } else {
          throw playError;
        }
      }

      result.isValid = result.details!.canLoadMetadata;
      console.log('AudioDiagnosticsService: Diagnóstico concluído:', result);
      
    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('AudioDiagnosticsService: Erro no diagnóstico:', result.error);
    }

    return result;
  }

  /**
   * Gera relatório detalhado de diagnóstico
   */
  static generateReport(result: AudioDiagnosticResult): string {
    const reports: string[] = [];
    
    if (!result.isValid) {
      reports.push(`❌ Áudio inválido: ${result.error || 'Erro desconhecido'}`);
    } else {
      reports.push('✅ Áudio válido');
    }

    if (result.details) {
      reports.push(`📊 Detalhes:`);
      reports.push(`  - Metadata: ${result.details.canLoadMetadata ? '✅' : '❌'}`);
      reports.push(`  - Reprodução: ${result.details.canPlay ? '✅' : '❌'}`);
      reports.push(`  - Rede: ${result.details.hasNetworkIssue ? '❌ Problema' : '✅ OK'}`);
      reports.push(`  - CORS: ${result.details.hasCorsIssue ? '❌ Problema' : '✅ OK'}`);
      reports.push(`  - Autoplay: ${result.details.hasAutoplayIssue ? '⚠️ Bloqueado' : '✅ OK'}`);
    }

    return reports.join('\n');
  }
}
