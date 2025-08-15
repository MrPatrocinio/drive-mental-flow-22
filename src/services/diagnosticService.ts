
/**
 * DiagnosticService - Serviço para diagnóstico e debug da aplicação
 * Responsabilidade: Centralizar logging e diagnósticos
 * Princípios: SRP para diagnósticos, KISS para implementação simples
 */

export class DiagnosticService {
  private static readonly LOG_PREFIX = '[DriveMemtal]';
  private static isDebugEnabled = true;

  /**
   * Log de informações gerais
   */
  static info(component: string, message: string, data?: any): void {
    if (!this.isDebugEnabled) return;
    
    const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
    console.log(`${this.LOG_PREFIX} [${timestamp}] ${component}: ${message}`, data || '');
  }

  /**
   * Log de erros
   */
  static error(component: string, message: string, error?: any): void {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
    console.error(`${this.LOG_PREFIX} [${timestamp}] ${component}: ${message}`, error || '');
  }

  /**
   * Log de avisos
   */
  static warn(component: string, message: string, data?: any): void {
    if (!this.isDebugEnabled) return;
    
    const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
    console.warn(`${this.LOG_PREFIX} [${timestamp}] ${component}: ${message}`, data || '');
  }

  /**
   * Diagnóstico do estado da aplicação
   */
  static diagnoseAppState(): void {
    console.group(`${this.LOG_PREFIX} Diagnóstico do Estado da Aplicação`);
    
    // Verificar rota atual
    console.log('Rota atual:', window.location.pathname);
    
    // Verificar local storage
    const storageKeys = Object.keys(localStorage);
    console.log('LocalStorage keys:', storageKeys);
    
    // Verificar se há dados no Supabase client
    try {
      console.log('Supabase disponível:', typeof window !== 'undefined');
    } catch (error) {
      console.error('Erro ao verificar Supabase:', error);
    }
    
    // Verificar conexão de rede
    console.log('Online:', navigator.onLine);
    
    // Verificar console errors
    const errors = window.performance?.getEntriesByType?.('navigation') || [];
    console.log('Navigation entries:', errors.length);
    
    console.groupEnd();
  }

  /**
   * Monitor de performance para carregamento
   */
  static monitorPageLoad(pageName: string): () => void {
    const startTime = performance.now();
    this.info('Performance', `Iniciando carregamento de ${pageName}`);
    
    return () => {
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      this.info('Performance', `${pageName} carregado em ${duration}ms`);
    };
  }

  /**
   * Verificar problemas comuns
   */
  static checkCommonIssues(): void {
    console.group(`${this.LOG_PREFIX} Verificação de Problemas Comuns`);
    
    // Verificar se há elementos esperados no DOM
    const headerElement = document.querySelector('header');
    console.log('Header encontrado:', !!headerElement);
    
    const mainElement = document.querySelector('main');
    console.log('Main encontrado:', !!mainElement);
    
    // Verificar se há erros de script
    const scriptErrors = document.querySelectorAll('script[data-error]');
    console.log('Scripts com erro:', scriptErrors.length);
    
    // Verificar se há recursos não carregados
    const images = document.querySelectorAll('img');
    const brokenImages = Array.from(images).filter(img => !img.complete || img.naturalHeight === 0);
    console.log('Imagens quebradas:', brokenImages.length);
    
    console.groupEnd();
  }

  /**
   * Habilitar/desabilitar debug
   */
  static setDebugEnabled(enabled: boolean): void {
    this.isDebugEnabled = enabled;
    this.info('Diagnostic', `Debug ${enabled ? 'habilitado' : 'desabilitado'}`);
  }
}

// Auto-executar diagnóstico em desenvolvimento
if (import.meta.env.DEV) {
  DiagnosticService.info('Diagnostic', 'Serviço de diagnóstico inicializado');
  
  // Aguardar DOM estar pronto
  document.addEventListener('DOMContentLoaded', () => {
    DiagnosticService.diagnoseAppState();
    DiagnosticService.checkCommonIssues();
  });
}
