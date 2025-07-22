/**
 * Audio Service - Gerenciamento de áudios no Supabase
 * Responsabilidade: CRUD de áudios e upload de arquivos
 * Princípio SRP: Apenas operações de áudio
 * Princípio SSOT: Fonte única da verdade para áudios
 */

import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Audio = Tables<"audios">;
export type AudioInsert = TablesInsert<"audios">;
export type AudioUpdate = TablesUpdate<"audios">;

export interface AudioWithFile extends Omit<AudioInsert, 'url'> {
  file?: File;
}

export class AudioService {
  /**
   * Buscar todos os áudios
   */
  static async getAll(): Promise<Audio[]> {
    const { data, error } = await supabase
      .from("audios")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Erro ao buscar áudios:", error);
      throw new Error("Falha ao carregar áudios");
    }

    return data || [];
  }

  /**
   * Buscar áudios por campo
   */
  static async getByField(fieldId: string): Promise<Audio[]> {
    const { data, error } = await supabase
      .from("audios")
      .select("*")
      .eq("field_id", fieldId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Erro ao buscar áudios do campo:", error);
      throw new Error("Falha ao carregar áudios do campo");
    }

    return data || [];
  }

  /**
   * Buscar áudio por ID
   */
  static async getById(id: string): Promise<Audio | null> {
    const { data, error } = await supabase
      .from("audios")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Erro ao buscar áudio:", error);
      return null;
    }

    return data;
  }

  /**
   * Upload de arquivo de áudio
   */
  static async uploadFile(file: File, fileName?: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const finalFileName = fileName || `${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from("audios")
      .upload(finalFileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error("Erro ao fazer upload do áudio:", error);
      throw new Error("Falha no upload do arquivo de áudio");
    }

    // Obter URL pública do arquivo
    const { data: { publicUrl } } = supabase.storage
      .from("audios")
      .getPublicUrl(data.path);

    return publicUrl;
  }

  /**
   * Criar novo áudio
   */
  static async create(audioData: AudioWithFile): Promise<Audio> {
    let audioUrl = audioData.file ? "" : "";

    // Se há arquivo, fazer upload primeiro
    if (audioData.file) {
      audioUrl = await this.uploadFile(audioData.file);
    }

    const insertData: AudioInsert = {
      title: audioData.title,
      duration: audioData.duration,
      url: audioUrl,
      field_id: audioData.field_id
    };

    const { data, error } = await supabase
      .from("audios")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar áudio:", error);
      throw new Error("Falha ao criar áudio");
    }

    return data;
  }

  /**
   * Atualizar áudio existente
   */
  static async update(id: string, audioData: Partial<AudioWithFile>): Promise<Audio> {
    let updateData: AudioUpdate = {};

    // Se há novo arquivo, fazer upload
    if (audioData.file) {
      const audioUrl = await this.uploadFile(audioData.file);
      updateData.url = audioUrl;
    }

    // Adicionar outros campos de atualização
    if (audioData.title) updateData.title = audioData.title;
    if (audioData.duration) updateData.duration = audioData.duration;
    if (audioData.field_id) updateData.field_id = audioData.field_id;

    const { data, error } = await supabase
      .from("audios")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar áudio:", error);
      throw new Error("Falha ao atualizar áudio");
    }

    return data;
  }

  /**
   * Deletar áudio
   */
  static async delete(id: string): Promise<void> {
    // Buscar áudio para obter URL do arquivo
    const audio = await this.getById(id);
    
    // Deletar registro do banco
    const { error } = await supabase
      .from("audios")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erro ao deletar áudio:", error);
      throw new Error("Falha ao deletar áudio");
    }

    // Deletar arquivo do storage se existir
    if (audio?.url) {
      try {
        const path = this.extractPathFromUrl(audio.url);
        if (path) {
          await supabase.storage
            .from("audios")
            .remove([path]);
        }
      } catch (storageError) {
        console.warn("Erro ao deletar arquivo do storage:", storageError);
        // Não falhar a operação se apenas o arquivo não foi deletado
      }
    }
  }

  /**
   * Extrair path do arquivo da URL pública
   */
  private static extractPathFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const audioBucketIndex = pathParts.findIndex(part => part === 'audios');
      
      if (audioBucketIndex !== -1 && pathParts[audioBucketIndex + 1]) {
        return pathParts.slice(audioBucketIndex + 1).join('/');
      }
      
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Buscar áudios por texto
   */
  static async search(query: string): Promise<Audio[]> {
    const { data, error } = await supabase
      .from("audios")
      .select("*")
      .or(`title.ilike.%${query}%, duration.ilike.%${query}%`)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Erro ao buscar áudios:", error);
      throw new Error("Falha na busca de áudios");
    }

    return data || [];
  }

  /**
   * Contar áudios por campo
   */
  static async countByField(fieldId: string): Promise<number> {
    const { count, error } = await supabase
      .from("audios")
      .select("*", { count: 'exact', head: true })
      .eq("field_id", fieldId);

    if (error) {
      console.error("Erro ao contar áudios:", error);
      return 0;
    }

    return count || 0;
  }
}