/**
 * Background Music Service
 * Responsabilidade: CRUD de músicas de fundo
 * Princípio SRP: Apenas operações de banco para background music
 */

import { supabase } from '@/integrations/supabase/client';

export interface BackgroundMusic {
  id: string;
  title: string;
  file_url: string;
  is_active: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export class BackgroundMusicService {
  static async getAll(): Promise<BackgroundMusic[]> {
    const { data, error } = await (supabase as any)
      .from('background_music')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getActive(): Promise<BackgroundMusic[]> {
    const { data, error } = await (supabase as any)
      .from('background_music')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getById(id: string): Promise<BackgroundMusic | null> {
    const { data, error } = await (supabase as any)
      .from('background_music')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async create(music: Omit<BackgroundMusic, 'id' | 'created_at' | 'updated_at'>): Promise<BackgroundMusic> {
    const { data, error } = await (supabase as any)
      .from('background_music')
      .insert(music)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, updates: Partial<BackgroundMusic>): Promise<BackgroundMusic> {
    const { data, error } = await (supabase as any)
      .from('background_music')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await (supabase as any)
      .from('background_music')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async toggleActive(id: string, isActive: boolean): Promise<BackgroundMusic> {
    return this.update(id, { is_active: isActive });
  }
}