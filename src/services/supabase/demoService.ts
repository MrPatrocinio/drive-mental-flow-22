/**
 * DemoService - Serviço para gerenciar configurações de demonstração
 * Responsabilidade: CRUD de configurações de áudio de demonstração
 * Princípio SRP: Apenas lógica de demonstração
 * Princípio SSOT: Única fonte de verdade para configurações de demo
 */

import { supabase } from "@/integrations/supabase/client";

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

    return {
      id: data.id,
      title: data.title,
      url: data.url,
      duration: data.duration,
      field_title: (data.fields as any).title
    };
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
   */
  static async setDemoAudio(audioId: string | null): Promise<void> {
    const currentConfig = await this.getDemoConfig();
    
    await this.saveDemoConfig({
      ...currentConfig,
      demo_audio_id: audioId
    });
  }
}