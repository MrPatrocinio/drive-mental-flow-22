/**
 * NavigationService - Serviço para navegação externa
 * 
 * Responsabilidade: centralizar lógica de redirecionamento para URLs externas,
 * com suporte a iframes e fallbacks para diferentes contextos de execução.
 */
export class NavigationService {
  /**
   * Verifica se o app está rodando dentro de um iframe
   */
  static isFramed(): boolean {
    try {
      return window.self !== window.top;
    } catch {
      // Se der erro ao acessar window.top, assumimos que estamos em iframe com restrições
      return true;
    }
  }

  /**
   * Tenta redirecionar para URL externa no top-level ou mesma aba
   * @returns true se conseguiu iniciar a navegação, false caso contrário
   */
  static goToExternal(url: string): boolean {
    try {
      // Se estiver em iframe, tenta navegar no top-level
      if (this.isFramed() && window.top) {
        window.top.location.href = url;
        return true;
      }
      
      // Caso padrão: redireciona na mesma aba
      window.location.href = url;
      return true;
    } catch (error) {
      console.warn('[NAVIGATION] Não foi possível redirecionar:', error);
      return false;
    }
  }

  /**
   * Abre URL em nova aba como fallback
   */
  static openInNewTab(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
