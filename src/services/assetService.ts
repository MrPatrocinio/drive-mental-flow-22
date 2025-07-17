/**
 * Asset Service - Single Source of Truth para recursos da aplicação
 * Responsabilidade: Gerenciar caminhos e referências de assets (imagens, logos, etc.)
 * Princípio SRP: Apenas gerencia assets
 * Princípio SSOT: Única fonte para referências de assets
 */

export class AssetService {
  // Logo paths - SSOT para todos os logos da aplicação
  static readonly LOGOS = {
    main: "/lovable-uploads/62d00bb8-310a-43c1-a44e-04e6a67f2c2c.png",
    fallback: "/placeholder.svg"
  } as const;

  // Placeholders para outros assets
  static readonly PLACEHOLDERS = {
    avatar: "/placeholder.svg",
    image: "/placeholder.svg"
  } as const;

  /**
   * Retorna o caminho da logo principal
   */
  static getMainLogo(): string {
    return this.LOGOS.main;
  }

  /**
   * Retorna logo com fallback em caso de erro
   */
  static getLogoWithFallback(): string {
    return this.LOGOS.main;
  }

  /**
   * Verifica se uma imagem existe/carregou corretamente
   */
  static async validateImage(src: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
    });
  }
}