/**
 * Favorites Service - Serviço para gerenciamento de favoritos
 * Responsabilidade: CRUD de favoritos
 * Princípio SRP: Apenas operações de favoritos
 * Princípio SSOT: Usa Supabase como fonte única
 */

import { supabase } from "@/integrations/supabase/client";

export interface Favorite {
  id: string;
  user_id: string;
  audio_id: string;
  created_at: string;
}

export interface FavoriteInsert {
  audio_id: string;
}

export class FavoritesService {
  /**
   * Buscar favoritos do usuário atual
   */
  static async getUserFavorites(): Promise<Favorite[]> {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar favoritos: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Verificar se um áudio é favorito
   */
  static async isFavorite(audioId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('audio_id', audioId)
      .maybeSingle();

    if (error) {
      throw new Error(`Erro ao verificar favorito: ${error.message}`);
    }

    return !!data;
  }

  /**
   * Adicionar aos favoritos
   */
  static async addToFavorites(audioId: string): Promise<Favorite> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('favorites')
      .insert({
        audio_id: audioId,
        user_id: user.user.id
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao adicionar favorito: ${error.message}`);
    }

    return data;
  }

  /**
   * Remover dos favoritos
   */
  static async removeFromFavorites(audioId: string): Promise<void> {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('audio_id', audioId);

    if (error) {
      throw new Error(`Erro ao remover favorito: ${error.message}`);
    }
  }

  /**
   * Toggle favorito (adiciona se não existe, remove se existe)
   */
  static async toggleFavorite(audioId: string): Promise<boolean> {
    const isFav = await this.isFavorite(audioId);
    
    if (isFav) {
      await this.removeFromFavorites(audioId);
      return false;
    } else {
      await this.addToFavorites(audioId);
      return true;
    }
  }
}