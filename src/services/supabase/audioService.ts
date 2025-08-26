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
   * Obter áudio de demonstração
   * MELHORADO: Validação de URL obrigatória
   */
  static async getDemoAudio(): Promise<Audio | null> {
    console.log('AudioService: Buscando áudio de demonstração');
    
    const { data, error } = await supabase
      .from('audios')
      .select(`
        id,
        title,
        url,
        duration,
        field_id,
        is_premium,
        is_demo,
        fields!inner(title)
      `)
      .eq('is_demo', true)
      .single();

    if (error) {
      console.error('AudioService: Erro ao buscar áudio demo:', error);
      return null;
    }

    if (!data) {
      console.log('AudioService: Nenhum áudio demo encontrado');
      return null;
    }

    // NOVA VALIDAÇÃO: Verificar se a URL não está vazia
    if (!data.url || data.url.trim() === '') {
      console.error('AudioService: Áudio demo encontrado mas URL está vazia:', {
        id: data.id,
        title: data.title,
        url: data.url
      });
      
      // Tentar corrigir automaticamente desmarcando este áudio como demo
      try {
        await this.update(data.id, { is_demo: false });
        console.log('AudioService: Áudio demo com URL vazia foi desmarcado automaticamente');
      } catch (updateError) {
        console.error('AudioService: Erro ao desmarcar áudio demo inválido:', updateError);
      }
      
      return null;
    }

    const audio: Audio = {
      id: data.id,
      title: data.title,
      url: data.url,
      duration: data.duration,
      field_id: data.field_id,
      is_premium: data.is_premium || false,
      is_demo: data.is_demo || false
    };

    console.log('AudioService: Áudio demo encontrado:', {
      id: audio.id,
      title: audio.title,
      hasValidUrl: !!audio.url && audio.url.trim() !== ''
    });

    return audio;
  }
}
