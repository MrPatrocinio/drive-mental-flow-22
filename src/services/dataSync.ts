/**
 * Data Sync Service
 * Responsabilidade: Sincronização de dados entre admin e cliente
 * Princípio SRP: Apenas lógica de sincronização de dados
 * Princípio SSOT: Centraliza eventos de mudança de dados
 */

import { realtimeConnection } from './realtimeConnection';

export type DataChangeEvent = 'fields_changed' | 'audios_changed' | 'content_changed';

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
      return;
    }

    // Conectar ao realtime
    realtimeConnection.connect();

    // Configurar listeners para mudanças de status da conexão
    realtimeConnection.onStatusChange((status) => {
      if (status === 'connected') {
        this.setupDatabaseListeners();
      }
    });

    this.isInitialized = true;
  }

  private setupDatabaseListeners(): void {
    const channel = realtimeConnection.getChannel();
    if (!channel) {
      console.error('DataSyncService: No channel available');
      return;
    }

    // Listener para tabela fields
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'fields'
      },
      (payload) => {
        console.log('DataSyncService: Fields changed', payload);
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
        console.log('DataSyncService: Audios changed', payload);
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
        console.log('DataSyncService: Content changed', payload);
        this.notifyListeners('content_changed', payload);
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
    this.listeners.forEach(listener => {
      try {
        listener(event, payload);
      } catch (error) {
        console.error('DataSyncService: Error in listener:', error);
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