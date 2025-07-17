/**
 * Sync Service - Responsável pela sincronização em tempo real entre admin e usuário
 * Responsabilidade: Gerenciar eventos de atualização de dados
 * Princípio SRP: Apenas sincronização de dados
 * Princípio SSOT: Centraliza notificações de mudanças
 */

type SyncEventType = 'audios_updated' | 'fields_updated' | 'content_updated';

interface SyncEventListener {
  (eventType: SyncEventType, data?: any): void;
}

export class SyncService {
  private static listeners: Map<string, SyncEventListener> = new Map();
  private static eventCounter = 0;

  /**
   * Registra um listener para eventos de sincronização
   */
  static subscribe(listener: SyncEventListener): string {
    const id = `listener_${++this.eventCounter}`;
    this.listeners.set(id, listener);
    return id;
  }

  /**
   * Remove um listener
   */
  static unsubscribe(listenerId: string): void {
    this.listeners.delete(listenerId);
  }

  /**
   * Dispara evento de sincronização
   */
  static notify(eventType: SyncEventType, data?: any): void {
    this.listeners.forEach(listener => {
      try {
        listener(eventType, data);
      } catch (error) {
        console.error('Erro ao executar listener de sincronização:', error);
      }
    });
  }

  /**
   * Notifica atualização de áudios
   */
  static notifyAudiosUpdated(): void {
    this.notify('audios_updated');
  }

  /**
   * Notifica atualização de campos
   */
  static notifyFieldsUpdated(): void {
    this.notify('fields_updated');
  }

  /**
   * Notifica atualização de conteúdo
   */
  static notifyContentUpdated(): void {
    this.notify('content_updated');
  }

  /**
   * Força atualização completa
   */
  static forceSync(): void {
    this.notifyAudiosUpdated();
    this.notifyFieldsUpdated();
    this.notifyContentUpdated();
  }
}