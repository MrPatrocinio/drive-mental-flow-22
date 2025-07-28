/**
 * Realtime Connection Service
 * Responsabilidade: Gerenciar conexão websocket do Supabase
 * Princípio SRP: Apenas gerenciamento de conexão
 * Princípio SSOT: Fonte única para status de conexão
 */

import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';
type ConnectionCallback = (status: ConnectionStatus) => void;

export class RealtimeConnection {
  private static instance: RealtimeConnection | null = null;
  private channel: RealtimeChannel | null = null;
  private status: ConnectionStatus = 'disconnected';
  private callbacks: Set<ConnectionCallback> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  private constructor() {}

  static getInstance(): RealtimeConnection {
    if (!RealtimeConnection.instance) {
      RealtimeConnection.instance = new RealtimeConnection();
    }
    return RealtimeConnection.instance;
  }

  connect(): void {
    if (this.channel && this.status === 'connected') {
      return; // Já conectado
    }

    this.updateStatus('connecting');
    
    // Limpar canal existente se houver
    if (this.channel) {
      supabase.removeChannel(this.channel);
    }

    this.channel = supabase
      .channel('admin-sync', {
        config: {
          presence: { key: 'user' },
          broadcast: { self: true }
        }
      })
      .subscribe((status) => {
        console.log('RealtimeConnection: Status changed to', status);
        
        switch (status) {
          case 'SUBSCRIBED':
            this.updateStatus('connected');
            this.reconnectAttempts = 0;
            break;
          case 'CLOSED':
            this.updateStatus('disconnected');
            this.handleReconnect();
            break;
          case 'CHANNEL_ERROR':
            this.updateStatus('error');
            this.handleReconnect();
            break;
          default:
            this.updateStatus('connecting');
        }
      });
  }

  disconnect(): void {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
    this.updateStatus('disconnected');
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  getChannel(): RealtimeChannel | null {
    return this.channel;
  }

  onStatusChange(callback: ConnectionCallback): () => void {
    this.callbacks.add(callback);
    
    // Chamar callback imediatamente com status atual
    callback(this.status);
    
    return () => {
      this.callbacks.delete(callback);
    };
  }

  private updateStatus(newStatus: ConnectionStatus): void {
    if (this.status !== newStatus) {
      this.status = newStatus;
      console.log('RealtimeConnection: Status updated to', newStatus);
      
      this.callbacks.forEach(callback => {
        try {
          callback(newStatus);
        } catch (error) {
          console.error('RealtimeConnection: Error in status callback:', error);
        }
      });
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('RealtimeConnection: Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`RealtimeConnection: Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }
}

export const realtimeConnection = RealtimeConnection.getInstance();