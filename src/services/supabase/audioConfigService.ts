
import { supabase } from "@/integrations/supabase/client";

/**
 * Serviço responsável pelas configurações de áudio administrativas
 * Segue princípio SRP: apenas lógica de configuração de áudio
 * Segue princípio SSOT: fonte única para configurações de áudio
 */
export interface AudioConfig {
  pause_between_repeats_seconds: number;
}

const DEFAULT_AUDIO_CONFIG: AudioConfig = {
  pause_between_repeats_seconds: 3
};

export class AudioConfigService {
  
  /**
   * Busca configurações de áudio do administrador
   * Princípio KISS: implementação simples e direta
   */
  static async getAudioConfig(): Promise<AudioConfig> {
    try {
      const { data, error } = await supabase
        .from('landing_content')
        .select('content')
        .eq('section', 'audio_config')
        .single();

      if (error || !data) {
        console.warn('AudioConfigService: Configuração não encontrada, usando padrão');
        return DEFAULT_AUDIO_CONFIG;
      }

      // Verificação segura antes do spread
      const content = data.content || {};
      
      return {
        ...DEFAULT_AUDIO_CONFIG,
        ...content
      } as AudioConfig;
    } catch (error) {
      console.error('AudioConfigService: Erro ao buscar configuração:', error);
      return DEFAULT_AUDIO_CONFIG;
    }
  }

  /**
   * Atualiza configurações de áudio do administrador
   * Princípio DRY: validação centralizada
   */
  static async updateAudioConfig(config: Partial<AudioConfig>): Promise<{ success: boolean; error?: string }> {
    try {
      // Validação fail-fast
      if (config.pause_between_repeats_seconds !== undefined) {
        if (config.pause_between_repeats_seconds < 2 || config.pause_between_repeats_seconds > 6) {
          return {
            success: false,
            error: 'Pausa deve estar entre 2 e 6 segundos'
          };
        }
      }

      const currentConfig = await this.getAudioConfig();
      const updatedConfig = { ...currentConfig, ...config };

      const { error } = await supabase
        .from('landing_content')
        .upsert({
          section: 'audio_config',
          content: updatedConfig
        });

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}
