
/**
 * LocalStorage Performance Service - Serviço para operações otimizadas de localStorage
 * Responsabilidade: Operações performáticas de localStorage
 * Princípio SRP: Apenas otimização de localStorage
 * Princípio KISS: Interface simples para operações complexas
 */

import { DebounceService } from './debounceService';

export class LocalStoragePerformanceService {
  private static readonly DEBOUNCE_DELAY = 100; // 100ms

  /**
   * Leitura síncrona otimizada
   */
  static getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('LocalStoragePerformanceService: Erro na leitura:', error);
      return null;
    }
  }

  /**
   * Escrita com debounce para evitar múltiplas operações
   */
  static setItemDebounced(key: string, value: string): void {
    const debouncedSet = DebounceService.debounce(
      `localStorage_${key}`,
      (k: string, v: string) => {
        try {
          localStorage.setItem(k, v);
        } catch (error) {
          console.warn('LocalStoragePerformanceService: Erro na escrita:', error);
        }
      },
      this.DEBOUNCE_DELAY
    );

    debouncedSet(key, value);
  }

  /**
   * Escrita imediata quando necessário
   */
  static setItemImmediate(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('LocalStoragePerformanceService: Erro na escrita imediata:', error);
    }
  }

  /**
   * Remoção com debounce
   */
  static removeItemDebounced(key: string): void {
    const debouncedRemove = DebounceService.debounce(
      `localStorage_remove_${key}`,
      (k: string) => {
        try {
          localStorage.removeItem(k);
        } catch (error) {
          console.warn('LocalStoragePerformanceService: Erro na remoção:', error);
        }
      },
      this.DEBOUNCE_DELAY
    );

    debouncedRemove(key);
  }
}
