import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Profile = Tables<"profiles">;
export type ProfileInsert = TablesInsert<"profiles">;
export type ProfileUpdate = TablesUpdate<"profiles">;

/**
 * Serviço para gerenciamento de perfis de usuários
 * Responsabilidade: CRUD de perfis na tabela profiles
 */
export class ProfileService {
  
  /**
   * Busca perfil do usuário autenticado
   */
  static async getCurrentUserProfile(): Promise<{ data: Profile | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .maybeSingle();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: "Erro interno ao buscar perfil" };
    }
  }

  /**
   * Atualiza perfil do usuário autenticado
   */
  static async updateProfile(updates: ProfileUpdate): Promise<{ data: Profile | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: "Erro interno ao atualizar perfil" };
    }
  }

  /**
   * Busca todos os perfis (apenas para admins)
   */
  static async getAllProfiles(): Promise<{ data: Profile[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: "Erro interno ao buscar perfis" };
    }
  }

  /**
   * Busca perfil por ID (apenas para admins)
   */
  static async getProfileById(id: string): Promise<{ data: Profile | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: "Erro interno ao buscar perfil" };
    }
  }
}