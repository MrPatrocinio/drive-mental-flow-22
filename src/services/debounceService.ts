
/**
 * Debounce Service - Serviço para controle de debounce
 * Responsabilidade: Gerenciar debounce de funções
 * Princípio SRP: Apenas operações de debounce
 * Princípio DRY: Reutilizável em toda aplicação
 */

export class DebounceService {
  private static timers = new Map<string, NodeJS.Timeout>();

  /**
   * Aplica debounce a uma função
   */
  static debounce<T extends (...args: any[]) => any>(
    key: string,
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    return (...args: Parameters<T>) => {
      // Limpa timer anterior se existir
      const existingTimer = this.timers.get(key);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Cria novo timer
      const newTimer = setTimeout(() => {
        func(...args);
        this.timers.delete(key);
      }, delay);

      this.timers.set(key, newTimer);
    };
  }

  /**
   * Cancela debounce de uma chave específica
   */
  static cancel(key: string): void {
    const timer = this.timers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(key);
    }
  }

  /**
   * Limpa todos os timers
   */
  static clearAll(): void {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
  }
}
