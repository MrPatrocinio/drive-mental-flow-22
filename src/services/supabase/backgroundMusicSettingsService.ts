/**
 * Background Music Settings Service
 * Responsabilidade: Gerenciar configurações administrativas
 * Princípio SRP: Apenas configurações globais do sistema
 */

import { supabase } from '@/integrations/supabase/client';

export interface BackgroundMusicSettings {
  id: string;
  volume_percentage: number;
  created_at: string;
  updated_at: string;
}

export class BackgroundMusicSettingsService {
  static async getSettings(): Promise<BackgroundMusicSettings | null> {
    const { data, error } = await (supabase as any)
      .from('background_music_settings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async updateVolumePercentage(volumePercentage: number): Promise<BackgroundMusicSettings> {
    // Primeiro tenta atualizar o registro existente
    const existing = await this.getSettings();
    
    if (existing) {
      const { data, error } = await (supabase as any)
        .from('background_music_settings')
        .update({ volume_percentage: volumePercentage })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Se não existe, cria um novo
      const { data, error } = await (supabase as any)
        .from('background_music_settings')
        .insert({ volume_percentage: volumePercentage })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }

  static async getVolumePercentage(): Promise<number> {
    const settings = await this.getSettings();
    return settings?.volume_percentage || 25; // Default 25%
  }
}