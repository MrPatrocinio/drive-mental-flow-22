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

/**
 * Enum para tipos de erro específicos (DRY principle)
 */
enum ConfigError {
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND', 
  UPDATE_FAILED = 'UPDATE_FAILED',
  INSERT_FAILED = 'INSERT_FAILED',
  UNKNOWN = 'UNKNOWN'
}

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
        .maybeSingle();

      if (error) {
        console.error('AudioConfigService: Erro ao buscar configuração:', error);
        return DEFAULT_AUDIO_CONFIG;
      }

      if (!data) {
        console.warn('AudioConfigService: Configuração não encontrada, usando padrão');
        return DEFAULT_AUDIO_CONFIG;
      }

      // Verificação segura e cast explícito para garantir tipo correto
      const content = data.content && typeof data.content === 'object' && !Array.isArray(data.content) 
        ? data.content as Record<string, any>
        : {};
      
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
   * Atualiza configurações de áudio com lógica condicional robusta
   * Princípio SRP: responsabilidade única de atualização
   * Princípio DRY: validação e tratamento de erro centralizados
   */
  static async updateAudioConfig(config: Partial<AudioConfig>): Promise<{ success: boolean; error?: string; errorType?: ConfigError }> {
    try {
      // Validação fail-fast (KISS principle) - agora inclui pausa zero
      const validationResult = this.validateConfig(config);
      if (!validationResult.isValid) {
        return {
          success: false,
          error: validationResult.error,
          errorType: ConfigError.VALIDATION
        };
      }

      const currentConfig = await this.getAudioConfig();
      const updatedConfig = { ...currentConfig, ...config };

      // Primeira tentativa: UPDATE no registro existente
      const updateResult = await this.tryUpdateConfig(updatedConfig);
      if (updateResult.success) {
        console.log('AudioConfigService: Configuração atualizada com sucesso via UPDATE');
        return { success: true };
      }

      // Se UPDATE falhou, tenta INSERT (caso registro não exista)
      if (updateResult.errorType === ConfigError.NOT_FOUND) {
        console.log('AudioConfigService: Registro não encontrado, tentando INSERT');
        const insertResult = await this.tryInsertConfig(updatedConfig);
        if (insertResult.success) {
          console.log('AudioConfigService: Configuração criada com sucesso via INSERT');
          return { success: true };
        }
        return insertResult;
      }

      // Retorna erro original do UPDATE se não foi por "não encontrado"
      return updateResult;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('AudioConfigService: Erro inesperado:', errorMessage);
      return {
        success: false,
        error: errorMessage,
        errorType: ConfigError.UNKNOWN
      };
    }
  }

  /**
   * Valida configuração (SRP: responsabilidade única de validação)
   * Atualizada para aceitar pausa zero (sem pausas)
   */
  private static validateConfig(config: Partial<AudioConfig>): { isValid: boolean; error?: string } {
    if (config.pause_between_repeats_seconds !== undefined) {
      // MODIFICAÇÃO: Agora aceita valor 0 (sem pausas) até 6 segundos
      if (config.pause_between_repeats_seconds < 0 || config.pause_between_repeats_seconds > 6) {
        return {
          isValid: false,
          error: 'Pausa deve estar entre 0 (sem pausas) e 6 segundos'
        };
      }
    }
    return { isValid: true };
  }

  /**
   * Tenta atualizar configuração existente (SRP: responsabilidade única de UPDATE)
   */
  private static async tryUpdateConfig(config: AudioConfig): Promise<{ success: boolean; error?: string; errorType?: ConfigError }> {
    try {
      const { data, error } = await supabase
        .from('landing_content')
        .update({ 
          content: config as any, // Cast explícito para Json
          updated_at: new Date().toISOString()
        })
        .eq('section', 'audio_config')
        .select();

      if (error) {
        console.error('AudioConfigService: Erro no UPDATE:', error);
        return {
          success: false,
          error: error.message,
          errorType: ConfigError.UPDATE_FAILED
        };
      }

      // Verifica se algum registro foi afetado
      if (!data || data.length === 0) {
        console.warn('AudioConfigService: Nenhum registro encontrado para UPDATE');
        return {
          success: false,
          error: 'Registro não encontrado para atualização',
          errorType: ConfigError.NOT_FOUND
        };
      }

      return { success: true };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no UPDATE';
      console.error('AudioConfigService: Exceção no UPDATE:', errorMessage);
      return {
        success: false,
        error: errorMessage,
        errorType: ConfigError.UPDATE_FAILED
      };
    }
  }

  /**
   * Tenta inserir nova configuração (SRP: responsabilidade única de INSERT) 
   */
  private static async tryInsertConfig(config: AudioConfig): Promise<{ success: boolean; error?: string; errorType?: ConfigError }> {
    try {
      const { error } = await supabase
        .from('landing_content')
        .insert({
          section: 'audio_config',
          content: config as any // Cast explícito para Json
        });

      if (error) {
        console.error('AudioConfigService: Erro no INSERT:', error);
        return {
          success: false,
          error: error.message,
          errorType: ConfigError.INSERT_FAILED
        };
      }

      return { success: true };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no INSERT';
      console.error('AudioConfigService: Exceção no INSERT:', errorMessage);
      return {
        success: false,
        error: errorMessage,
        errorType: ConfigError.INSERT_FAILED
      };
    }
  }
}
