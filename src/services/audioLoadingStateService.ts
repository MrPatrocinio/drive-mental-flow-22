
/**
 * Audio Loading State Service
 * Responsabilidade: Gerenciar estados de carregamento do áudio
 * Princípio SRP: Apenas lógica de estados de loading
 * Princípio SSOT: Fonte única para estados de carregamento
 */

export interface AudioLoadingState {
  isLoading: boolean;
  canPlay: boolean;
  isReady: boolean;
  hasError: boolean;
  errorMessage?: string;
  loadingStartTime?: number;
  renderCount: number;
}

export class AudioLoadingStateService {
  private static renderCounters = new Map<string, number>();

  /**
   * Cria um estado inicial de loading
   */
  static createInitialState(): AudioLoadingState {
    return {
      isLoading: false,
      canPlay: false,
      isReady: false,
      hasError: false,
      renderCount: 0
    };
  }

  /**
   * Marca início do carregamento
   */
  static markLoadingStart(audioUrl: string): Partial<AudioLoadingState> {
    const renderCount = this.incrementRenderCount(audioUrl);
    
    console.log(`🔄 LoadingState: Iniciando carregamento (render #${renderCount}) para ${audioUrl.substring(0, 50)}...`);
    
    return {
      isLoading: true,
      canPlay: false,
      isReady: false,
      hasError: false,
      errorMessage: undefined,
      loadingStartTime: Date.now(),
      renderCount
    };
  }

  /**
   * Marca carregamento como concluído
   */
  static markLoadingComplete(duration?: number): Partial<AudioLoadingState> {
    console.log('✅ LoadingState: Carregamento concluído', { duration });
    
    return {
      isLoading: false,
      canPlay: true,
      isReady: true,
      hasError: false,
      errorMessage: undefined
    };
  }

  /**
   * Marca erro no carregamento
   */
  static markLoadingError(error: string): Partial<AudioLoadingState> {
    console.error('❌ LoadingState: Erro no carregamento:', error);
    
    return {
      isLoading: false,
      canPlay: false,
      isReady: false,
      hasError: true,
      errorMessage: error
    };
  }

  /**
   * Verifica se deve forçar saída do loading por timeout
   */
  static shouldForceLoadingComplete(state: AudioLoadingState): boolean {
    if (!state.isLoading || !state.loadingStartTime) return false;
    
    const elapsed = Date.now() - state.loadingStartTime;
    const shouldForce = elapsed > 5000; // 5 segundos timeout
    
    if (shouldForce) {
      console.warn('⏰ LoadingState: Forçando saída do loading por timeout');
    }
    
    return shouldForce;
  }

  /**
   * Incrementa contador de renders para detectar loops
   */
  private static incrementRenderCount(audioUrl: string): number {
    const current = this.renderCounters.get(audioUrl) || 0;
    const newCount = current + 1;
    this.renderCounters.set(audioUrl, newCount);
    
    if (newCount > 5) {
      console.warn(`⚠️ LoadingState: Muitos re-renders detectados (${newCount}) para ${audioUrl.substring(0, 50)}...`);
    }
    
    return newCount;
  }

  /**
   * Reseta contador de renders
   */
  static resetRenderCount(audioUrl: string): void {
    this.renderCounters.delete(audioUrl);
  }

  /**
   * Limpa todos os contadores
   */
  static clearAllCounters(): void {
    this.renderCounters.clear();
  }
}
