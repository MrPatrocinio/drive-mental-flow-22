/**
 * Serviço responsável por detectar e monitorar o status de conectividade
 * Segue o princípio SRP: apenas detecção de conectividade
 */

export type ConnectionStatus = 'online' | 'offline' | 'slow';

export interface ConnectionInfo {
  isOnline: boolean;
  status: ConnectionStatus;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
}

export type ConnectionListener = (connectionInfo: ConnectionInfo) => void;

export class OfflineStatusService {
  private static listeners: Set<ConnectionListener> = new Set();
  private static currentStatus: ConnectionInfo = {
    isOnline: navigator.onLine,
    status: navigator.onLine ? 'online' : 'offline'
  };

  /**
   * Inicializa o monitoramento de conectividade
   */
  static initialize(): void {
    // Listeners básicos de online/offline
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    // Monitoramento de qualidade da conexão (se disponível)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection?.addEventListener('change', this.handleConnectionChange.bind(this));
      this.updateConnectionInfo();
    }

    // Teste periódico de conectividade real
    this.startPeriodicCheck();
  }

  /**
   * Adiciona listener para mudanças de conectividade
   */
  static addListener(listener: ConnectionListener): () => void {
    this.listeners.add(listener);
    
    // Notifica imediatamente sobre o status atual
    listener(this.currentStatus);

    // Retorna função para remover o listener
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Obtém o status atual de conectividade
   */
  static getCurrentStatus(): ConnectionInfo {
    return { ...this.currentStatus };
  }

  /**
   * Testa conectividade fazendo uma requisição real
   */
  static async testConnectivity(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Handler para evento online
   */
  private static handleOnline(): void {
    this.updateConnectionInfo();
  }

  /**
   * Handler para evento offline
   */
  private static handleOffline(): void {
    this.currentStatus = {
      isOnline: false,
      status: 'offline'
    };
    this.notifyListeners();
  }

  /**
   * Handler para mudanças na qualidade da conexão
   */
  private static handleConnectionChange(): void {
    this.updateConnectionInfo();
  }

  /**
   * Atualiza informações detalhadas da conexão
   */
  private static updateConnectionInfo(): void {
    const isOnline = navigator.onLine;
    let status: ConnectionStatus = isOnline ? 'online' : 'offline';
    let effectiveType: string | undefined;
    let downlink: number | undefined;
    let rtt: number | undefined;

    if (isOnline && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      effectiveType = connection?.effectiveType;
      downlink = connection?.downlink;
      rtt = connection?.rtt;

      // Determina se a conexão é lenta
      if (effectiveType === 'slow-2g' || effectiveType === '2g' || 
          (downlink && downlink < 0.5) || (rtt && rtt > 2000)) {
        status = 'slow';
      }
    }

    this.currentStatus = {
      isOnline,
      status,
      effectiveType,
      downlink,
      rtt
    };

    this.notifyListeners();
  }

  /**
   * Notifica todos os listeners sobre mudanças
   */
  private static notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentStatus);
      } catch (error) {
        console.error('Erro ao notificar listener de conectividade:', error);
      }
    });
  }

  /**
   * Inicia verificação periódica de conectividade
   */
  private static startPeriodicCheck(): void {
    setInterval(async () => {
      if (navigator.onLine) {
        const isReallyOnline = await this.testConnectivity();
        if (!isReallyOnline && this.currentStatus.isOnline) {
          // Navegador diz que está online, mas teste falhou
          this.currentStatus = {
            isOnline: false,
            status: 'offline'
          };
          this.notifyListeners();
        }
      }
    }, 30000); // Verifica a cada 30 segundos
  }

  /**
   * Remove todos os listeners e limpa recursos
   */
  static cleanup(): void {
    window.removeEventListener('online', this.handleOnline.bind(this));
    window.removeEventListener('offline', this.handleOffline.bind(this));
    
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection?.removeEventListener('change', this.handleConnectionChange.bind(this));
    }

    this.listeners.clear();
  }

  /**
   * Força uma verificação imediata de conectividade
   */
  static async forceCheck(): Promise<void> {
    const isOnline = await this.testConnectivity();
    
    if (isOnline !== this.currentStatus.isOnline) {
      this.updateConnectionInfo();
    }
  }
}