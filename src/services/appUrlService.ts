/**
 * AppUrlService - Serviço de URL base da aplicação
 * Responsabilidade: Centralizar a URL base do app (princípio SSOT)
 * Princípio KISS: Detecta automaticamente via window.location.origin
 */
export class AppUrlService {
  /**
   * Retorna a URL base da aplicação
   * Usa window.location.origin para garantir que sempre aponte para o ambiente correto
   * 
   * @returns URL base completa (ex: https://drive-mental-flow-65.lovable.app)
   */
  static getBaseUrl(): string {
    return window.location.origin;
  }

  /**
   * Constrói uma URL completa a partir de um caminho relativo
   * 
   * @param path - Caminho relativo (ex: /reset-password)
   * @returns URL completa (ex: https://drive-mental-flow-65.lovable.app/reset-password)
   */
  static buildUrl(path: string): string {
    const baseUrl = this.getBaseUrl();
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  }
}
