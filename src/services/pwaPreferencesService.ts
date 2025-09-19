/**
 * PWA Preferences Service - Gerencia preferências de instalação PWA
 * Responsabilidade: Apenas preferências PWA no localStorage
 * Princípio SRP: Apenas gerenciamento de preferências PWA
 */

import { LocalStoragePerformanceService } from './localStoragePerformanceService';

export class PWAPreferencesService {
  private static readonly DISMISSED_KEY = 'dm:dismissedInstall';
  private static readonly LAST_ROUTE_KEY = 'dm:lastRoute';

  /**
   * Verifica se usuário descartou o CTA de instalação
   */
  static isDismissed(): boolean {
    return LocalStoragePerformanceService.getItem(this.DISMISSED_KEY) === '1';
  }

  /**
   * Marca o CTA como descartado
   */
  static setDismissed(): void {
    LocalStoragePerformanceService.setItemImmediate(this.DISMISSED_KEY, '1');
  }

  /**
   * Obtém a última rota visitada
   */
  static getLastRoute(): string | null {
    return LocalStoragePerformanceService.getItem(this.LAST_ROUTE_KEY);
  }

  /**
   * Salva a última rota visitada
   */
  static setLastRoute(route: string): void {
    if (route && route !== '/' && route !== '/landing') {
      LocalStoragePerformanceService.setItemDebounced(this.LAST_ROUTE_KEY, route);
    }
  }

  /**
   * Reset das preferências (para testes)
   */
  static reset(): void {
    localStorage.removeItem(this.DISMISSED_KEY);
    localStorage.removeItem(this.LAST_ROUTE_KEY);
  }
}