
/**
 * Realtime Landing Service
 * Responsabilidade: Gerenciar atualizações em tempo real do conteúdo da landing (princípio SRP)
 * Princípio SSOT: Centraliza notificações de mudanças no conteúdo
 */

import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { syncDiagnostics } from './syncDiagnostics';
import { landingContentService } from './landingContentService';

type ContentChangeCallback = () => void;

export class RealtimeLandingService {
  private static instance: RealtimeLandingService | null = null;
  private channel: RealtimeChannel | null = null;
  private callbacks: Set<ContentChangeCallback> = new Set();
  private isInitialized = false;

  private constructor() {}

  static getInstance(): RealtimeLandingService {
    if (!RealtimeLandingService.instance) {
      RealtimeLandingService.instance = new RealtimeLandingService();
    }
    return RealtimeLandingService.instance;
  }

  initialize(): void {
    if (this.isInitialized) {
      syncDiagnostics.log('realtime_landing_already_initialized', 'warning');
      return;
    }

    syncDiagnostics.log('initializing_realtime_landing', 'success');

    this.channel = supabase
      .channel('landing-content-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'landing_content'
        },
        (payload) => {
          syncDiagnostics.log('landing_content_realtime_change', 'success', {
            event: payload.eventType,
            record: payload.new || payload.old
          });

          // Invalidar cache e notificar callbacks
          landingContentService.invalidateCache();
          this.notifyCallbacks();
        }
      )
      .subscribe((status) => {
        syncDiagnostics.log('realtime_landing_status', 'success', { status });
      });

    this.isInitialized = true;
    syncDiagnostics.log('realtime_landing_initialized', 'success');
  }

  subscribe(callback: ContentChangeCallback): () => void {
    this.callbacks.add(callback);
    
    if (!this.isInitialized) {
      this.initialize();
    }
    
    return () => {
      this.callbacks.delete(callback);
    };
  }

  private notifyCallbacks(): void {
    syncDiagnostics.log('notifying_landing_callbacks', 'success', { 
      callbackCount: this.callbacks.size 
    });

    this.callbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        syncDiagnostics.log('landing_callback_error', 'error', { error });
      }
    });
  }

  disconnect(): void {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
      this.callbacks.clear();
      this.isInitialized = false;
      syncDiagnostics.log('realtime_landing_disconnected', 'success');
    }
  }
}

export const realtimeLandingService = RealtimeLandingService.getInstance();
