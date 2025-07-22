/**
 * Field Service - Gerenciamento de campos no Supabase
 * Responsabilidade: CRUD de campos na base de dados
 * Princípio SRP: Apenas operações de campo
 * Princípio SSOT: Fonte única da verdade para campos
 */

import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Field = Tables<"fields">;
export type FieldInsert = TablesInsert<"fields">;
export type FieldUpdate = TablesUpdate<"fields">;

export class FieldService {
  /**
   * Buscar todos os campos
   */
  static async getAll(): Promise<Field[]> {
    const { data, error } = await supabase
      .from("fields")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Erro ao buscar campos:", error);
      throw new Error("Falha ao carregar campos");
    }

    return data || [];
  }

  /**
   * Buscar campo por ID
   */
  static async getById(id: string): Promise<Field | null> {
    const { data, error } = await supabase
      .from("fields")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Erro ao buscar campo:", error);
      return null;
    }

    return data;
  }

  /**
   * Criar novo campo
   */
  static async create(fieldData: FieldInsert): Promise<Field> {
    const { data, error } = await supabase
      .from("fields")
      .insert(fieldData)
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar campo:", error);
      throw new Error("Falha ao criar campo");
    }

    return data;
  }

  /**
   * Atualizar campo existente
   */
  static async update(id: string, fieldData: FieldUpdate): Promise<Field> {
    const { data, error } = await supabase
      .from("fields")
      .update(fieldData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar campo:", error);
      throw new Error("Falha ao atualizar campo");
    }

    return data;
  }

  /**
   * Deletar campo
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("fields")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erro ao deletar campo:", error);
      throw new Error("Falha ao deletar campo");
    }
  }

  /**
   * Verificar se campo existe
   */
  static async exists(id: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("fields")
      .select("id")
      .eq("id", id)
      .single();

    return !error && !!data;
  }
}