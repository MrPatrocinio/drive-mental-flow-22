
/**
 * Audio Loading Timeout Service
 * Responsabilidade: Gerenciar timeouts de carregamento de áudio
 * Princípio SRP: Apenas lógica de timeout
 * Princípio SSOT: Fonte única para configurações de timeout
 */

export interface LoadingTimeoutConfig {
  timeoutMs: number;
  onTimeout: () => void;
  onSuccess: () => void;
}

export class AudioLoadingTimeoutService {
  private static timeouts = new Map<string, NodeJS.Timeout>();

  /**
   * Inicia um timeout para carregamento de áudio
   */
  static startTimeout(key: string, config: LoadingTimeoutConfig): void {
    // Limpar timeout existente se houver
    this.clearTimeout(key);

    console.log(`⏰ AudioLoadingTimeout: Iniciando timeout de ${config.timeoutMs}ms para ${key}`);
    
    const timeoutId = setTimeout(() => {
      console.warn(`⏰ AudioLoadingTimeout: Timeout atingido para ${key}`);
      this.timeouts.delete(key);
      config.onTimeout();
    }, config.timeoutMs);

    this.timeouts.set(key, timeoutId);
  }

  /**
   * Marca o carregamento como bem-sucedido e limpa o timeout
   */
  static markSuccess(key: string, onSuccess?: () => void): void {
    console.log(`✅ AudioLoadingTimeout: Carregamento bem-sucedido para ${key}`);
    this.clearTimeout(key);
    onSuccess?.();
  }

  /**
   * Limpa um timeout específico
   */
  static clearTimeout(key: string): void {
    const timeoutId = this.timeouts.get(key);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.timeouts.delete(key);
      console.log(`🗑️ AudioLoadingTimeout: Timeout limpo para ${key}`);
    }
  }

  /**
   * Limpa todos os timeouts
   */
  static clearAllTimeouts(): void {
    this.timeouts.forEach((timeoutId, key) => {
      clearTimeout(timeoutId);
      console.log(`🗑️ AudioLoadingTimeout: Timeout limpo para ${key}`);
    });
    this.timeouts.clear();
  }
}
