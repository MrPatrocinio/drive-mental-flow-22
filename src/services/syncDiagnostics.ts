/**
 * Sync Diagnostics Service
 * Responsabilidade: Diagnóstico e debug de sincronização
 * Princípio SRP: Apenas lógica de diagnóstico
 */

interface SyncDiagnostic {
  timestamp: Date;
  event: string;
  status: 'success' | 'warning' | 'error';
  details: any;
}

export class SyncDiagnosticsService {
  private static instance: SyncDiagnosticsService | null = null;
  private diagnostics: SyncDiagnostic[] = [];
  private maxDiagnostics = 100;

  private constructor() {}

  static getInstance(): SyncDiagnosticsService {
    if (!SyncDiagnosticsService.instance) {
      SyncDiagnosticsService.instance = new SyncDiagnosticsService();
    }
    return SyncDiagnosticsService.instance;
  }

  log(event: string, status: 'success' | 'warning' | 'error', details?: any): void {
    const diagnostic: SyncDiagnostic = {
      timestamp: new Date(),
      event,
      status,
      details
    };

    this.diagnostics.unshift(diagnostic);
    
    // Manter apenas os últimos diagnósticos
    if (this.diagnostics.length > this.maxDiagnostics) {
      this.diagnostics = this.diagnostics.slice(0, this.maxDiagnostics);
    }

    // Log no console para debug
    const prefix = `[SyncDiag-${status.toUpperCase()}]`;
    console.log(`${prefix} ${event}`, details || '');
  }

  getDiagnostics(): SyncDiagnostic[] {
    return [...this.diagnostics];
  }

  getLastError(): SyncDiagnostic | null {
    return this.diagnostics.find(d => d.status === 'error') || null;
  }

  clear(): void {
    this.diagnostics = [];
  }
}

export const syncDiagnostics = SyncDiagnosticsService.getInstance();