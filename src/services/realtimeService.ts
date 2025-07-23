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

  private constructor() {}

  static getInstance(): RealtimeService {
    if (!RealtimeService.instance) {
      RealtimeService.instance = new RealtimeService();
    }
    return RealtimeService.instance;
  }

  subscribe(callbacks: RealtimeCallbacks): () => void {
    this.callbacks.add(callbacks);
    
    if (!this.channel) {
      this.initializeChannel();
    }

    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callbacks);
      if (this.callbacks.size === 0) {
        this.cleanup();
      }
    };
  }

  private initializeChannel(): void {
    this.channel = supabase
      .channel('admin-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fields'
        },
        () => {
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
        () => {
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
        () => {
          this.notifyCallbacks('onLandingContentChange');
        }
      )
      .subscribe();
  }

  private notifyCallbacks(event: keyof RealtimeCallbacks): void {
    this.callbacks.forEach(callbacks => {
      const callback = callbacks[event];
      if (callback) {
        callback();
      }
    });
  }

  private cleanup(): void {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }
}

export const realtimeService = RealtimeService.getInstance();