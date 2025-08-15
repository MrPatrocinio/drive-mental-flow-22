/**
 * Data Sync Service
 * Responsabilidade: Sincronização de dados entre admin e cliente
 * Princípio SRP: Apenas lógica de sincronização de dados
 * Princípio SSOT: Centraliza eventos de mudança de dados
 */

import { realtimeConnection } from './realtimeConnection';
import { syncDiagnostics } from './syncDiagnostics';

export type DataChangeEvent = 'fields_changed' | 'audios_changed' | 'content_changed' | 'videos_changed';

interface DataChangeListener {
  (event: DataChangeEvent, payload?: any): void;
}

export class DataSyncService {
  private static instance: DataSyncService | null = null;
  private listeners: Map<string, DataChangeListener> = new Map();
  private listenerCounter = 0;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): DataSyncService {
    if (!DataSyncService.instance) {
      DataSyncService.instance = new DataSyncService();
    }
    return DataSyncService.instance;
  }

  initialize(): void {
    if (this.isInitialized) {
      syncDiagnostics.log('sync_already_initialized', 'warning');
      return;
    }

    syncDiagnostics.log('sync_initializing', 'success');

    // Conectar ao realtime
    realtimeConnection.connect();

    // Configurar listeners para mudanças de status da conexão
    realtimeConnection.onStatusChange((status) => {
      syncDiagnostics.log('realtime_status_change', 'success', { status });
      
      if (status === 'connected') {
        this.setupDatabaseListeners();
      } else if (status === 'error' || status === 'disconnected') {
        syncDiagnostics.log('realtime_connection_issue', 'error', { status });
      }
    });

    this.isInitialized = true;
    syncDiagnostics.log('sync_initialized', 'success');
  }

  private setupDatabaseListeners(): void {
    const channel = realtimeConnection.getChannel();
    if (!channel) {
      syncDiagnostics.log('channel_not_available', 'error');
      return;
    }

    syncDiagnostics.log('setting_up_database_listeners', 'success');

    // Listener para tabela fields
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'fields'
      },
      (payload) => {
        syncDiagnostics.log('fields_changed', 'success', payload);
        this.notifyListeners('fields_changed', payload);
      }
    );

    // Listener para tabela audios
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'audios'
      },
      (payload) => {
        syncDiagnostics.log('audios_changed', 'success', payload);
        this.notifyListeners('audios_changed', payload);
      }
    );

    // Listener para tabela landing_content
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'landing_content'
      },
      (payload) => {
        syncDiagnostics.log('content_changed', 'success', payload);
        this.notifyListeners('content_changed', payload);
      }
    );

    // Listener para mudanças em vídeos (detecta mudanças na seção videos do landing_content)
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'landing_content',
        filter: 'section=eq.videos'
      },
      (payload) => {
        syncDiagnostics.log('videos_changed', 'success', payload);
        this.notifyListeners('videos_changed', payload);
      }
    );
  }

  subscribe(listener: DataChangeListener): string {
    const id = `listener_${++this.listenerCounter}`;
    this.listeners.set(id, listener);
    
    // Inicializar se ainda não foi feito
    if (!this.isInitialized) {
      this.initialize();
    }
    
    return id;
  }

  unsubscribe(listenerId: string): void {
    this.listeners.delete(listenerId);
  }

  private notifyListeners(event: DataChangeEvent, payload?: any): void {
    syncDiagnostics.log('notifying_listeners', 'success', { 
      event, 
      listenerCount: this.listeners.size 
    });

    this.listeners.forEach(listener => {
      try {
        listener(event, payload);
      } catch (error) {
        syncDiagnostics.log('listener_error', 'error', { event, error });
      }
    });
  }

  // Método para forçar notificação manual (útil após operações admin)
  static forceNotification(event: DataChangeEvent, payload?: any): void {
    const instance = DataSyncService.getInstance();
    instance.notifyListeners(event, payload);
  }
}

export const dataSyncService = DataSyncService.getInstance();