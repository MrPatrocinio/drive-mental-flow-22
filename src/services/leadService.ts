/**
 * leadService - Serviço para gerenciar leads de inscrição
 * Responsabilidade: Operações CRUD de leads (princípio SRP)
 * Princípio SSOT: Fonte única da verdade para operações de leads
 */

import { supabase } from "@/integrations/supabase/client";

export interface Lead {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  interest_field?: string;
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateLeadData {
  name: string;
  email: string;
  phone?: string;
  interest_field?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

/**
 * Serviço para operações de leads
 * Princípio SoC: Separa lógica de dados da lógica de apresentação
 */
export const leadService = {
  /**
   * Criar um novo lead
   */
  async createLead(leadData: CreateLeadData): Promise<{ data: Lead | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert([{
          ...leadData,
          source: 'inscricao_page'
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar lead:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Erro interno ao criar lead:', err);
      return { data: null, error: 'Erro interno do servidor' };
    }
  },

  /**
   * Listar leads (apenas para admins)
   */
  async getLeads(): Promise<{ data: Lead[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar leads:', error);
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (err) {
      console.error('Erro interno ao buscar leads:', err);
      return { data: null, error: 'Erro interno do servidor' };
    }
  },

  /**
   * Verificar se email já existe
   */
  async checkEmailExists(email: string): Promise<{ exists: boolean; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (error) {
        console.error('Erro ao verificar email:', error);
        return { exists: false, error: error.message };
      }

      return { exists: !!data, error: null };
    } catch (err) {
      console.error('Erro interno ao verificar email:', err);
      return { exists: false, error: 'Erro interno do servidor' };
    }
  }
};