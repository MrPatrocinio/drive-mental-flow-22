
/**
 * DemoService - Serviço para gerenciar configurações de demonstração
 * Responsabilidade: CRUD de configurações de áudio de demonstração
 * Princípio SRP: Apenas lógica de demonstração
 * Princípio SSOT: Única fonte de verdade para configurações de demo
 * MELHORADO: Validação de áudio
 */

import { supabase } from "@/integrations/supabase/client";
import { AudioValidationService } from "@/services/audioValidationService";

export interface DemoConfig {
  demo_audio_id: string | null;
  demo_title: string;
  demo_description: string;
}

export interface DemoAudio {
  id: string;
  title: string;
  url: string;
  duration: string;
  field_title: string;
}

export class DemoService {
  /**
   * Obter configuração atual de demonstração
   */
  static async getDemoConfig(): Promise<DemoConfig> {
    const { data, error } = await supabase
      .from('landing_content')
      .select('content')
      .eq('section', 'demo_config')
      .single();

    if (error) {
      console.error('Error fetching demo config:', error);
      throw error;
    }

    return data.content as unknown as DemoConfig;
  }

  /**
   * Salvar configuração de demonstração
   */
  static async saveDemoConfig(config: DemoConfig): Promise<void> {
    const { error } = await supabase
      .from('landing_content')
      .update({
        content: config as any,
        updated_at: new Date().toISOString()
      })
      .eq('section', 'demo_config');

    if (error) {
      console.error('Error saving demo config:', error);
      throw error;
    }

    // Notificar mudança via DataSync
    const { DataSyncService } = await import('@/services/dataSync');
    DataSyncService.forceNotification('content_changed', { 
      event: 'UPDATE', 
      new: config,
      section: 'demo_config'
    });
  }

  /**
   * Obter áudio de demonstração com detalhes
   * MELHORADO: Validação de URL obrigatória
   */
  static async getDemoAudio(): Promise<DemoAudio | null> {
    const config = await this.getDemoConfig();
    
    if (!config.demo_audio_id) {
      return null;
    }

    const { data, error } = await supabase
      .from('audios')
      .select(`
        id,
        title,
        url,
        duration,
        fields!inner(title)
      `)
      .eq('id', config.demo_audio_id)
      .single();

    if (error) {
      console.error('Error fetching demo audio:', error);
      return null;
    }

    // NOVA VALIDAÇÃO: Verificar URL antes de retornar
    if (!data.url || data.url.trim() === '') {
      console.error('DemoService: Áudio demo configurado mas URL está vazia:', {
        id: data.id,
        title: data.title,
        url: data.url
      });

      // Limpar configuração de demo inválida
      try {
        await this.saveDemoConfig({
          ...config,
          demo_audio_id: null
        });
        console.log('DemoService: Configuração de demo inválida foi limpa automaticamente');
      } catch (cleanupError) {
        console.error('DemoService: Erro ao limpar configuração inválida:', cleanupError);
      }

      return null;
    }

    const demoAudio: DemoAudio = {
      id: data.id,
      title: data.title,
      url: data.url,
      duration: data.duration,
      field_title: (data.fields as any).title
    };

    // Validar URL do áudio em segundo plano
    this.validateDemoAudioUrl(demoAudio.url).catch(error => {
      console.warn('DemoService: Aviso - URL do áudio demo pode estar com problemas:', error);
    });

    return demoAudio;
  }

  /**
   * Valida URL do áudio de demonstração
   */
  private static async validateDemoAudioUrl(url: string): Promise<boolean> {
    try {
      const validation = await AudioValidationService.validateAudioUrl(url);
      if (!validation.isValid) {
        console.error('DemoService: URL do áudio demo inválida:', validation.error);
        return false;
      }
      console.log('DemoService: URL do áudio demo validada com sucesso');
      return true;
    } catch (error) {
      console.error('DemoService: Erro na validação do áudio demo:', error);
      return false;
    }
  }

  /**
   * Listar todos os áudios disponíveis para demonstração
   */
  static async getAvailableAudios(): Promise<DemoAudio[]> {
    const { data, error } = await supabase
      .from('audios')
      .select(`
        id,
        title,
        url,
        duration,
        fields!inner(title)
      `)
      .order('title');

    if (error) {
      console.error('Error fetching available audios:', error);
      throw error;
    }

    return data.map(audio => ({
      id: audio.id,
      title: audio.title,
      url: audio.url,
      duration: audio.duration,
      field_title: (audio.fields as any).title
    }));
  }

  /**
   * Definir áudio como demonstração
   * MELHORADO: Validação obrigatória antes de definir
   */
  static async setDemoAudio(audioId: string | null): Promise<void> {
    // Se audioId é null, apenas limpar a demo
    if (!audioId) {
      const currentConfig = await this.getDemoConfig();
      await this.saveDemoConfig({
        ...currentConfig,
        demo_audio_id: null
      });
      return;
    }

    // Buscar dados do áudio para validação
    const { data: audioData, error } = await supabase
      .from('audios')
      .select('url, title')
      .eq('id', audioId)
      .single();

    if (error) {
      console.error('DemoService: Erro ao buscar áudio para validação:', error);
      throw new Error('Áudio não encontrado');
    }

    // VALIDAÇÃO OBRIGATÓRIA: Verificar se tem URL válida
    if (!audioData.url || audioData.url.trim() === '') {
      console.error('DemoService: Tentativa de definir áudio sem URL como demo:', {
        id: audioId,
        title: audioData.title,
        url: audioData.url
      });
      throw new Error('Não é possível definir como demo: áudio não possui URL válida');
    }

    // Validar URL antes de definir como demo
    console.log('DemoService: Validando áudio antes de definir como demo');
    const validation = await AudioValidationService.validateAudioUrl(audioData.url);
    
    if (!validation.isValid) {
      console.error('DemoService: Áudio inválido para demo:', validation.error);
      throw new Error(`Áudio inválido: ${validation.error}`);
    }

    console.log('DemoService: Áudio validado, definindo como demo');
    const currentConfig = await this.getDemoConfig();
    
    await this.saveDemoConfig({
      ...currentConfig,
      demo_audio_id: audioId
    });
  }

  /**
   * Verificar saúde do áudio de demonstração atual
   */
  static async checkDemoAudioHealth(): Promise<{ isHealthy: boolean; error?: string }> {
    try {
      const demoAudio = await this.getDemoAudio();
      
      if (!demoAudio) {
        return { isHealthy: false, error: 'Nenhum áudio de demo configurado' };
      }

      const validation = await AudioValidationService.validateAudioUrl(demoAudio.url);
      
      return {
        isHealthy: validation.isValid,
        error: validation.error
      };
    } catch (error) {
      console.error('DemoService: Erro no health check:', error);
      return {
        isHealthy: false,
        error: 'Erro ao verificar saúde do áudio'
      };
    }
  }
}
