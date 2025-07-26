
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface RealtimeCallbacks {
  onFieldsChange?: () => void;
  onAudiosChange?: () => void;
  onLandingContentChange?: () => void;
}

export class RealtimeService {
  private static instance: RealtimeService | null = null;
  private channel: RealtimeChannel | null = null;
  private callbacks: Set<RealtimeCallbacks> = new Set();
  private isConnected = false;

  private constructor() {}

  static getInstance(): RealtimeService {
    if (!RealtimeService.instance) {
      RealtimeService.instance = new RealtimeService();
    }
    return RealtimeService.instance;
  }

  subscribe(callbacks: RealtimeCallbacks): () => void {
    console.log('RealtimeService: Nova subscription adicionada', callbacks);
    this.callbacks.add(callbacks);
    
    if (!this.channel || !this.isConnected) {
      this.initializeChannel();
    }

    // Return unsubscribe function
    return () => {
      console.log('RealtimeService: Subscription removida');
      this.callbacks.delete(callbacks);
      if (this.callbacks.size === 0) {
        this.cleanup();
      }
    };
  }

  private initializeChannel(): void {
    if (this.channel) {
      console.log('RealtimeService: Limpando canal existente');
      supabase.removeChannel(this.channel);
    }

    console.log('RealtimeService: Inicializando novo canal de tempo real');
    this.channel = supabase
      .channel('admin-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fields'
        },
        (payload) => {
          console.log('RealtimeService: Mudança detectada na tabela fields', payload);
          this.notifyCallbacks('onFieldsChange');
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'audios'
        },
        (payload) => {
          console.log('RealtimeService: Mudança detectada na tabela audios', payload);
          this.notifyCallbacks('onAudiosChange');
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'landing_content'
        },
        (payload) => {
          console.log('RealtimeService: Mudança detectada na tabela landing_content', payload);
          this.notifyCallbacks('onLandingContentChange');
        }
      )
      .subscribe((status) => {
        console.log('RealtimeService: Status da subscription', status);
        this.isConnected = status === 'SUBSCRIBED';
      });
  }

  private notifyCallbacks(event: keyof RealtimeCallbacks): void {
    console.log(`RealtimeService: Notificando ${this.callbacks.size} callbacks para evento ${event}`);
    this.callbacks.forEach(callbacks => {
      const callback = callbacks[event];
      if (callback) {
        try {
          callback();
        } catch (error) {
          console.error(`RealtimeService: Erro ao executar callback ${event}:`, error);
        }
      }
    });
  }

  private cleanup(): void {
    console.log('RealtimeService: Limpando recursos');
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
      this.isConnected = false;
    }
  }

  // Método para forçar notificação manual (útil para operações admin)
  static forceRefresh(): void {
    const instance = RealtimeService.getInstance();
    console.log('RealtimeService: Forçando refresh de todos os dados');
    instance.notifyCallbacks('onFieldsChange');
    instance.notifyCallbacks('onAudiosChange');
    instance.notifyCallbacks('onLandingContentChange');
  }
}

export const realtimeService = RealtimeService.getInstance();
