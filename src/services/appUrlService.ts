/**
 * AppUrlService - Serviço de URL base da aplicação
 * Responsabilidade: Centralizar a URL base do app (princípio SSOT)
 * Princípio KISS: Detecta automaticamente via window.location.origin
 */
export class AppUrlService {
  /**
   * Domínio canônico de produção
   * Garante que emails de recuperação sempre usem o domínio principal
   */
  private static readonly CANONICAL_BASE_URL = "https://app.drivemental.com.br";

  /**
   * Retorna a URL base da aplicação
   * Sempre retorna o domínio canônico para garantir consistência
   * 
   * @returns URL base completa (https://app.drivemental.com.br)
   */
  static getBaseUrl(): string {
    return this.CANONICAL_BASE_URL;
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
