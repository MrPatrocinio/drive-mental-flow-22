/**
 * Sync Fallback Service
 * Responsabilidade: Sistema de fallback para sincronização
 * Princípio SRP: Apenas lógica de fallback
 */

import { syncDiagnostics } from './syncDiagnostics';

interface FallbackOptions {
  intervalMs: number;
  maxRetries: number;
  onRefresh: () => Promise<void>;
}

export class SyncFallbackService {
  private static instance: SyncFallbackService | null = null;
  private intervalId: NodeJS.Timeout | null = null;
  private isPolling = false;
  private retryCount = 0;

  private constructor() {}

  static getInstance(): SyncFallbackService {
    if (!SyncFallbackService.instance) {
      SyncFallbackService.instance = new SyncFallbackService();
    }
    return SyncFallbackService.instance;
  }

  startPolling(options: FallbackOptions): void {
    if (this.isPolling) {
      syncDiagnostics.log('fallback_already_running', 'warning');
      return;
    }

    this.isPolling = true;
    this.retryCount = 0;
    
    syncDiagnostics.log('fallback_started', 'success', { 
      intervalMs: options.intervalMs,
      maxRetries: options.maxRetries 
    });

    this.intervalId = setInterval(async () => {
      try {
        if (this.retryCount >= options.maxRetries) {
          this.stopPolling();
          syncDiagnostics.log('fallback_max_retries', 'error', { retries: this.retryCount });
          return;
        }

        await options.onRefresh();
        this.retryCount++;
        
        syncDiagnostics.log('fallback_refresh', 'success', { attempt: this.retryCount });
      } catch (error) {
        syncDiagnostics.log('fallback_error', 'error', error);
      }
    }, options.intervalMs);
  }

  stopPolling(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isPolling = false;
    syncDiagnostics.log('fallback_stopped', 'success');
  }

  isRunning(): boolean {
    return this.isPolling;
  }

  async forceRefresh(onRefresh: () => Promise<void>): Promise<void> {
    try {
      syncDiagnostics.log('force_refresh_start', 'success');
      await onRefresh();
      syncDiagnostics.log('force_refresh_success', 'success');
    } catch (error) {
      syncDiagnostics.log('force_refresh_error', 'error', error);
      throw error;
    }
  }
}

export const syncFallback = SyncFallbackService.getInstance();