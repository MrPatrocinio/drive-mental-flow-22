import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Field = Tables<"fields">;
export type Audio = Tables<"audios">;
export type Playlist = Tables<"playlists">;
export type PlaylistItem = Tables<"playlist_items">;
export type LandingContent = Tables<"landing_content">;

export type FieldInsert = TablesInsert<"fields">;
export type AudioInsert = TablesInsert<"audios">;
export type PlaylistInsert = TablesInsert<"playlists">;
export type PlaylistItemInsert = TablesInsert<"playlist_items">;
export type LandingContentInsert = TablesInsert<"landing_content">;

/**
 * Serviço para gerenciamento de dados no Supabase
 * Responsabilidade: CRUD operations para todas as entidades principais
 * Princípios: SRP para cada operação, DRY para padrões de query
 */
export class SupabaseDataService {
  
  // ==================== FIELDS ====================
  
  /**
   * Busca todos os campos (fields)
   */
  static async getFields(): Promise<{ data: Field[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('fields')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: "Erro interno ao buscar campos" };
    }
  }

  /**
   * Busca campo por ID
   */
  static async getFieldById(id: string): Promise<{ data: Field | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('fields')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: "Erro interno ao buscar campo" };
    }
  }

  /**
   * Cria novo campo (apenas admin)
   */
  static async createField(field: FieldInsert): Promise<{ data: Field | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('fields')
        .insert(field)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: "Erro interno ao criar campo" };
    }
  }

  /**
   * Atualiza campo (apenas admin)
   */
  static async updateField(id: string, updates: Partial<FieldInsert>): Promise<{ data: Field | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('fields')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: "Erro interno ao atualizar campo" };
    }
  }

  // ==================== AUDIOS ====================
  
  /**
   * Busca áudios de um campo específico
   */
  static async getAudiosByField(fieldId: string): Promise<{ data: Audio[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('audios')
        .select('*')
        .eq('field_id', fieldId)
        .order('created_at', { ascending: true });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: "Erro interno ao buscar áudios" };
    }
  }

  /**
   * Busca áudio por ID
   */
  static async getAudioById(id: string): Promise<{ data: Audio | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('audios')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: "Erro interno ao buscar áudio" };
    }
  }

  /**
   * Cria novo áudio (apenas admin)
   */
  static async createAudio(audio: AudioInsert): Promise<{ data: Audio | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('audios')
        .insert(audio)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: "Erro interno ao criar áudio" };
    }
  }

  // ==================== PLAYLISTS ====================
  
  /**
   * Busca playlists do usuário autenticado
   */
  static async getUserPlaylists(): Promise<{ data: Playlist[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: "Erro interno ao buscar playlists" };
    }
  }

  /**
   * Cria nova playlist
   */
  static async createPlaylist(playlist: Omit<PlaylistInsert, 'user_id'>): Promise<{ data: Playlist | null; error: string | null }> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        return { data: null, error: "Usuário não autenticado" };
      }

      const { data, error } = await supabase
        .from('playlists')
        .insert({ ...playlist, user_id: userData.user.id })
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: "Erro interno ao criar playlist" };
    }
  }

  // ==================== LANDING CONTENT ====================
  
  /**
   * Busca conteúdo da landing page
   */
  static async getLandingContent(): Promise<{ data: LandingContent[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('landing_content')
        .select('*');

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: "Erro interno ao buscar conteúdo" };
    }
  }

  /**
   * Atualiza conteúdo da landing page (apenas admin)
   */
  static async updateLandingContent(section: string, content: any): Promise<{ data: LandingContent | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('landing_content')
        .upsert({ section, content })
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: "Erro interno ao atualizar conteúdo" };
    }
  }
}