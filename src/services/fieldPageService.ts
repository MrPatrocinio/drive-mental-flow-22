
/**
 * Field Page Service
 * Responsabilidade: Lógica de negócio para páginas de campo
 * Princípio SRP: Apenas lógica relacionada a campos
 * Princípio SSOT: Centraliza operações de campo
 */

import { supabase } from "@/integrations/supabase/client";

interface AudioData {
  id: string;
  title: string;
  description?: string;
  file_url: string;
  cover_image_url?: string;
  duration?: string;
  tags?: string[];
}

interface FieldData {
  id: string;
  title: string;
  description?: string;
}

export class FieldPageService {
  /**
   * Valida se uma string é um UUID válido
   */
  static isValidUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  /**
   * Busca informações do campo por ID
   */
  static async getFieldById(fieldId: string): Promise<FieldData> {
    console.log('FieldPageService: Buscando campo por ID:', fieldId);
    
    const { data: fieldData, error: fieldError } = await supabase
      .from('fields')
      .select('*')
      .eq('id', fieldId)
      .single();

    if (fieldError) {
      console.error('FieldPageService: Erro ao buscar campo:', fieldError);
      if (fieldError.code === 'PGRST116') {
        throw new Error('Campo não encontrado');
      } else {
        throw new Error('Erro ao carregar informações do campo');
      }
    }

    return {
      id: fieldData.id,
      title: fieldData.title,
      description: fieldData.description
    };
  }

  /**
   * Busca áudios de um campo
   */
  static async getAudiosByFieldId(fieldId: string): Promise<AudioData[]> {
    console.log('FieldPageService: Buscando áudios para o campo:', fieldId);
    
    const { data: audiosData, error: audiosError } = await supabase
      .from('audios')
      .select('*')
      .eq('field_id', fieldId)
      .order('title');

    if (audiosError) {
      console.error('FieldPageService: Erro ao buscar áudios:', audiosError);
      throw new Error('Erro ao carregar áudios');
    }

    return audiosData?.map(audio => ({
      id: audio.id,
      title: audio.title,
      description: undefined,
      file_url: audio.url,
      cover_image_url: undefined,
      duration: audio.duration,
      tags: audio.tags || []
    })) || [];
  }

  /**
   * Filtra áudios acessíveis (todos são acessíveis agora)
   */
  static filterAccessibleAudios(audios: AudioData[]): AudioData[] {
    // Todos os áudios são acessíveis agora
    return audios;
  }

  /**
   * Extrai todas as tags únicas dos áudios
   */
  static extractAllTags(audios: AudioData[]): string[] {
    return Array.from(
      new Set(
        audios.flatMap(audio => audio.tags || [])
      )
    ).sort();
  }

  /**
   * Filtra áudios por tags selecionadas
   */
  static filterAudiosByTags(audios: AudioData[], selectedTags: string[]): AudioData[] {
    if (selectedTags.length === 0) {
      return audios;
    }
    
    return audios.filter(audio => 
      audio.tags && audio.tags.some((tag: string) => selectedTags.includes(tag))
    );
  }
}
