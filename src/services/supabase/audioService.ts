

import { supabase } from '@/integrations/supabase/client';

export interface Audio {
  id: string;
  title: string;
  url: string;
  duration: string;
  field_id: string;
  tags: string[];
  is_premium: boolean;
  is_demo?: boolean;
  created_at: string;
  updated_at: string;
}

export interface AudioInsert {
  title: string;
  url: string;
  duration: string;
  field_id: string;
  tags?: string[];
  is_premium?: boolean;
  is_demo?: boolean;
}

export interface AudioUpdate {
  title?: string;
  url?: string;
  duration?: string;
  field_id?: string;
  tags?: string[];
  is_premium?: boolean;
  is_demo?: boolean;
}

export interface AudioWithFile {
  id?: string;
  title: string;
  duration: string;
  field_id: string;
  tags?: string[];
  url?: string;
  file?: File;
  is_premium?: boolean;
  is_demo?: boolean;
}

/**
 * Serviço para operações com áudios
 * Princípio SRP: Responsável apenas por operações de dados de áudio
 */
export class AudioService {
  static async getAll(): Promise<Audio[]> {
    console.log('AudioService: Buscando todos os áudios');
    const { data, error } = await supabase
      .from('audios')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('AudioService: Erro ao buscar áudios:', error);
      throw error;
    }

    console.log('AudioService: Áudios encontrados:', data?.length || 0);
    return data || [];
  }

  static async getByField(fieldId: string): Promise<Audio[]> {
    console.log('AudioService: Buscando áudios por campo:', fieldId);
    const { data, error } = await supabase
      .from('audios')
      .select('*')
      .eq('field_id', fieldId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('AudioService: Erro ao buscar áudios por campo:', error);
      throw error;
    }

    console.log('AudioService: Áudios encontrados para o campo:', data?.length || 0);
    return data || [];
  }

  static async getById(id: string): Promise<Audio | null> {
    console.log('AudioService: Buscando áudio por ID:', id);
    const { data, error } = await supabase
      .from('audios')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('AudioService: Áudio não encontrado:', id);
        return null;
      }
      console.error('AudioService: Erro ao buscar áudio:', error);
      throw error;
    }

    console.log('AudioService: Áudio encontrado:', data.title);
    return data;
  }

  static async create(audio: AudioInsert): Promise<Audio> {
    console.log('AudioService: Criando áudio:', audio);
    const { data, error } = await supabase
      .from('audios')
      .insert(audio)
      .select()
      .single();

    if (error) {
      console.error('AudioService: Erro ao criar áudio:', error);
      throw error;
    }

    console.log('AudioService: Áudio criado com sucesso:', data.title);
    return data;
  }

  static async update(id: string, audio: AudioUpdate): Promise<Audio> {
    console.log('AudioService: Atualizando áudio:', id, audio);
    const { data, error } = await supabase
      .from('audios')
      .update(audio)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('AudioService: Erro ao atualizar áudio:', error);
      throw error;
    }

    console.log('AudioService: Áudio atualizado com sucesso:', data.title);
    return data;
  }

  static async delete(id: string): Promise<void> {
    console.log('AudioService: Deletando áudio:', id);
    const { error } = await supabase
      .from('audios')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('AudioService: Erro ao deletar áudio:', error);
      throw error;
    }

    console.log('AudioService: Áudio deletado com sucesso');
  }

  /**
   * Busca o áudio atual de demonstração
   */
  static async getDemoAudio(): Promise<Audio | null> {
    console.log('AudioService: Buscando áudio de demonstração');
    
    try {
      // Usar uma abordagem mais simples para evitar problemas de type inference
      const result = await supabase.rpc('get_demo_audio');
      
      if (result.error) {
        console.error('AudioService: Erro ao buscar áudio demo:', result.error);
        // Fallback para query manual se a função não existir
        const fallbackResult = await supabase
          .from('audios')
          .select('id, title, url, duration, field_id, tags, is_premium, is_demo, created_at, updated_at')
          .eq('is_demo', true)
          .limit(1);
        
        if (fallbackResult.error) {
          throw fallbackResult.error;
        }
        
        if (!fallbackResult.data || fallbackResult.data.length === 0) {
          console.log('AudioService: Nenhum áudio demo encontrado');
          return null;
        }
        
        const demoAudio = fallbackResult.data[0] as Audio;
        console.log('AudioService: Áudio demo encontrado:', demoAudio.title);
        return demoAudio;
      }
      
      if (!result.data || result.data.length === 0) {
        console.log('AudioService: Nenhum áudio demo encontrado');
        return null;
      }
      
      const demoAudio = result.data[0] as Audio;
      console.log('AudioService: Áudio demo encontrado:', demoAudio.title);
      return demoAudio;
    } catch (error) {
      console.error('AudioService: Erro inesperado ao buscar áudio demo:', error);
      throw error;
    }
  }
}
