/**
 * Audio History Service - Serviço para gerenciamento de histórico de reprodução
 * Responsabilidade: CRUD de histórico de áudios
 * Princípio SRP: Apenas operações de histórico
 * Princípio SSOT: Usa Supabase como fonte única
 */

import { supabase } from "@/integrations/supabase/client";

export interface AudioHistory {
  id: string;
  user_id: string;
  audio_id: string;
  played_at: string;
  progress_seconds: number;
  completed: boolean;
}

export interface AudioHistoryInsert {
  audio_id: string;
  progress_seconds?: number;
  completed?: boolean;
}

export interface AudioHistoryUpdate {
  progress_seconds?: number;
  completed?: boolean;
}

export class AudioHistoryService {
  /**
   * Buscar histórico do usuário atual
   */
  static async getUserHistory(limit: number = 50): Promise<AudioHistory[]> {
    const { data, error } = await supabase
      .from('audio_history')
      .select('*')
      .order('played_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Erro ao buscar histórico: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Buscar histórico de um áudio específico
   */
  static async getAudioHistory(audioId: string): Promise<AudioHistory | null> {
    const { data, error } = await supabase
      .from('audio_history')
      .select('*')
      .eq('audio_id', audioId)
      .order('played_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(`Erro ao buscar histórico do áudio: ${error.message}`);
    }

    return data;
  }

  /**
   * Registrar reprodução de áudio
   */
  static async recordPlayback(audioId: string, progressSeconds: number = 0): Promise<AudioHistory> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('audio_history')
      .insert({
        audio_id: audioId,
        user_id: user.user.id,
        progress_seconds: progressSeconds,
        completed: false
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao registrar reprodução: ${error.message}`);
    }

    return data;
  }

  /**
   * Atualizar progresso de reprodução
   */
  static async updateProgress(
    audioId: string, 
    progressSeconds: number, 
    completed: boolean = false
  ): Promise<void> {
    // Buscar histórico mais recente do áudio
    const existingHistory = await this.getAudioHistory(audioId);
    
    if (existingHistory) {
      // Atualizar histórico existente
      const { error } = await supabase
        .from('audio_history')
        .update({
          progress_seconds: progressSeconds,
          completed: completed,
          played_at: new Date().toISOString()
        })
        .eq('id', existingHistory.id);

      if (error) {
        throw new Error(`Erro ao atualizar progresso: ${error.message}`);
      }
    } else {
      // Criar novo registro se não existir
      await this.recordPlayback(audioId, progressSeconds);
    }
  }

  /**
   * Marcar áudio como completado
   */
  static async markAsCompleted(audioId: string): Promise<void> {
    const existingHistory = await this.getAudioHistory(audioId);
    
    if (existingHistory) {
      const { error } = await supabase
        .from('audio_history')
        .update({
          completed: true,
          played_at: new Date().toISOString()
        })
        .eq('id', existingHistory.id);

      if (error) {
        throw new Error(`Erro ao marcar como completado: ${error.message}`);
      }
    }
  }

  /**
   * Limpar histórico do usuário
   */
  static async clearHistory(): Promise<void> {
    const { error } = await supabase
      .from('audio_history')
      .delete()
      .not('user_id', 'is', null); // Deleta apenas do usuário atual

    if (error) {
      throw new Error(`Erro ao limpar histórico: ${error.message}`);
    }
  }

  /**
   * Buscar estatísticas de reprodução
   */
  static async getPlaybackStats(): Promise<{
    totalPlayedTime: number;
    completedAudios: number;
    totalPlays: number;
  }> {
    const { data, error } = await supabase
      .from('audio_history')
      .select('progress_seconds, completed');

    if (error) {
      throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
    }

    const totalPlayedTime = data?.reduce((sum, record) => sum + record.progress_seconds, 0) || 0;
    const completedAudios = data?.filter(record => record.completed).length || 0;
    const totalPlays = data?.length || 0;

    return {
      totalPlayedTime,
      completedAudios,
      totalPlays
    };
  }
}