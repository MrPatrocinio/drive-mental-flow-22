/**
 * Serviço responsável pela lógica de reprodução de áudio
 * Segue o princípio SRP: apenas lógica de player de áudio
 */
export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
  canPlay: boolean;
  isTransitioning: boolean;
  isInternalPause: boolean; // Novo estado interno para controle técnico
}

export interface AudioPlayerEvents {
  onStateChange: (state: AudioPlayerState) => void;
  onRepeatComplete?: () => void;
  onError?: (error: string) => void;
}

export class AudioPlayerService {
  private audioElement: HTMLAudioElement | null = null;
  private events: AudioPlayerEvents;
  private pauseTimeout: NodeJS.Timeout | null = null;
  private isLoopExecuting: boolean = false; // NOVA FLAG DE PROTEÇÃO
  private state: AudioPlayerState = {
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    isLoading: false,
    hasError: false,
    canPlay: false,
    isTransitioning: false,
    isInternalPause: false
  };

  constructor(events: AudioPlayerEvents) {
    this.events = events;
  }

  /**
   * Inicializa o player com um elemento de áudio
   */
  initialize(audioElement: HTMLAudioElement) {
    this.audioElement = audioElement;
    this.setupEventListeners();
  }

  /**
   * Configura os listeners do elemento de áudio
   */
  private setupEventListeners() {
    if (!this.audioElement) return;

    const audio = this.audioElement;

    // Eventos de carregamento
    audio.addEventListener('loadstart', () => {
      console.log('AudioPlayerService: Iniciando carregamento');
      this.updateState({ isLoading: true, hasError: false });
    });

    audio.addEventListener('loadedmetadata', () => {
      console.log('AudioPlayerService: Metadata carregada');
      this.updateState({ 
        duration: audio.duration,
        isLoading: false,
        canPlay: true 
      });
    });

    audio.addEventListener('canplay', () => {
      console.log('AudioPlayerService: Áudio pronto para reprodução');
      this.updateState({ canPlay: true, isLoading: false });
    });

    audio.addEventListener('canplaythrough', () => {
      console.log('AudioPlayerService: Áudio completamente carregado');
      this.updateState({ isLoading: false });
    });

    // Eventos de reprodução
    audio.addEventListener('timeupdate', () => {
      if (!this.state.isTransitioning && !this.state.isInternalPause) {
        this.updateState({ currentTime: audio.currentTime });
      }
    });

    audio.addEventListener('play', () => {
      console.log('AudioPlayerService: Reprodução iniciada');
      this.updateState({ 
        isPlaying: true, 
        isTransitioning: false, 
        isInternalPause: false 
      });
    });

    audio.addEventListener('pause', () => {
      console.log('AudioPlayerService: Evento pause detectado', {
        isInternalPause: this.state.isInternalPause,
        isTransitioning: this.state.isTransitioning,
        currentIsPlaying: this.state.isPlaying
      });
      
      // Só atualiza isPlaying se não está em pausa interna ou transição
      if (!this.state.isInternalPause && !this.state.isTransitioning) {
        console.log('AudioPlayerService: Reprodução pausada pelo usuário - atualizando estado');
        this.updateState({ isPlaying: false });
      } else {
        console.log('AudioPlayerService: Pausa interna/transição detectada - mantendo isPlaying=true');
      }
    });

    audio.addEventListener('ended', () => {
      console.log('AudioPlayerService: Áudio terminou - verificando se deve executar loop');
      
      // PROTEÇÃO: Só executa se não há loop em andamento
      if (!this.isLoopExecuting) {
        console.log('AudioPlayerService: Iniciando transição de loop');
        this.updateState({ isTransitioning: true });
        this.events.onRepeatComplete?.();
      } else {
        console.log('AudioPlayerService: Loop já em execução, ignorando evento ended');
      }
    });

    // Eventos de erro - MELHORADOS
    audio.addEventListener('error', (e) => {
      const errorMessage = this.getAudioErrorMessage(audio.error);
      console.error('AudioPlayerService: Erro no áudio:', errorMessage);
      this.updateState({ 
        hasError: true, 
        isLoading: false,
        errorMessage,
        canPlay: false,
        isTransitioning: false,
        isInternalPause: false
      });
      this.events.onError?.(errorMessage);
    });

    // NOVO: Tratamento específico para AbortError
    audio.addEventListener('abort', () => {
      console.log('AudioPlayerService: Reprodução abortada - isso pode ser normal durante loops');
      // Não considera AbortError como erro fatal se estamos executando um loop
      if (!this.isLoopExecuting) {
        console.warn('AudioPlayerService: AbortError inesperado fora de loop');
      }
    });

    audio.addEventListener('stalled', () => {
      console.warn('AudioPlayerService: Reprodução travada');
      this.updateState({ 
        hasError: true, 
        errorMessage: 'Reprodução interrompida - problema de conexão',
        isLoading: false,
        isTransitioning: false,
        isInternalPause: false
      });
    });
  }

  /**
   * Converte códigos de erro do áudio em mensagens legíveis
   */
  private getAudioErrorMessage(error: MediaError | null): string {
    if (!error) return 'Erro desconhecido';

    switch (error.code) {
      case MediaError.MEDIA_ERR_ABORTED:
        return 'Reprodução cancelada pelo usuário';
      case MediaError.MEDIA_ERR_NETWORK:
        return 'Erro de rede ao carregar o áudio';
      case MediaError.MEDIA_ERR_DECODE:
        return 'Erro ao decodificar o arquivo de áudio';
      case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
        return 'Formato de áudio não suportado ou arquivo não encontrado';
      default:
        return 'Erro desconhecido na reprodução';
    }
  }

  /**
   * Atualiza o estado e notifica os observadores
   */
  private updateState(updates: Partial<AudioPlayerState>) {
    this.state = { ...this.state, ...updates };
    this.events.onStateChange(this.state);
  }

  /**
   * Inicia ou pausa a reprodução
   */
  async togglePlay(): Promise<void> {
    if (!this.audioElement || !this.state.canPlay) return;

    // Cancela pausa interna se usuário tentar reproduzir durante ela
    if (this.state.isInternalPause) {
      this.cancelInternalPause();
    }

    try {
      if (this.state.isPlaying) {
        console.log('AudioPlayerService: Pausando reprodução');
        this.audioElement.pause();
      } else {
        console.log('AudioPlayerService: Iniciando reprodução');
        await this.audioElement.play();
      }
    } catch (error) {
      // MELHORADO: Tratamento específico para AbortError
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log('AudioPlayerService: AbortError capturado (pode ser normal durante transições)');
        return; // Não trata como erro fatal
      }

      const errorMessage = error instanceof Error ? error.message : 'Erro ao reproduzir áudio';
      console.error('AudioPlayerService: Erro no togglePlay:', errorMessage);
      this.updateState({ 
        hasError: true, 
        errorMessage,
        isPlaying: false,
        isTransitioning: false,
        isInternalPause: false
      });
      this.events.onError?.(errorMessage);
    }
  }

  /**
   * Redefine o áudio para o início
   */
  reset(): void {
    if (!this.audioElement) return;
    
    console.log('AudioPlayerService: Resetando áudio');
    this.cancelInternalPause();
    this.isLoopExecuting = false; // RESET DA FLAG
    this.audioElement.currentTime = 0;
    this.updateState({ 
      currentTime: 0, 
      isTransitioning: false,
      isInternalPause: false
    });
  }

  /**
   * Executa loop com pausa configurável - MELHORADO com proteção contra execução simultânea
   */
  async performLoopWithPause(pauseSeconds: number): Promise<void> {
    if (!this.audioElement) return;

    // PROTEÇÃO: Evita execuções simultâneas
    if (this.isLoopExecuting) {
      console.log('AudioPlayerService: Loop já em execução, ignorando nova solicitação');
      return;
    }

    this.isLoopExecuting = true;
    console.log('AudioPlayerService: Iniciando loop com proteção ativada');

    try {
      // Se pauseSeconds é 0, executa loop imediato
      if (pauseSeconds === 0) {
        console.log('AudioPlayerService: Executando loop contínuo (sem pausas)');
        return await this.performLoop();
      }

      console.log(`AudioPlayerService: Executando loop com pausa interna de ${pauseSeconds} segundos`);
      
      this.updateState({ 
        isTransitioning: false,
        isInternalPause: true,
        isPlaying: true // MANTÉM isPlaying=true durante pausa interna
      });
      
      // Aguarda um ciclo de event loop para garantir sincronização
      await new Promise(resolve => setTimeout(resolve, 0));
      
      console.log('AudioPlayerService: Estado atualizado - pausando áudio tecnicamente');
      
      // Pausa técnica interna (elemento HTML apenas)
      this.audioElement.pause();
      
      // Aguarda o tempo de pausa configurado
      this.pauseTimeout = setTimeout(async () => {
        if (!this.audioElement || !this.state.isInternalPause) {
          this.isLoopExecuting = false;
          return;
        }
        
        try {
          console.log('AudioPlayerService: Finalizando pausa interna - reiniciando reprodução');
          
          // Reset para o início
          this.audioElement.currentTime = 0;
          
          // Inicia reprodução
          await this.audioElement.play();
          
          console.log('AudioPlayerService: Loop após pausa interna concluído');
        } catch (error) {
          console.error('AudioPlayerService: Erro no loop após pausa:', error);
          this.updateState({ 
            hasError: true, 
            isTransitioning: false,
            isInternalPause: false,
            isPlaying: false 
          });
        } finally {
          this.isLoopExecuting = false;
        }
      }, pauseSeconds * 1000);
      
    } catch (error) {
      console.error('AudioPlayerService: Erro no loop com pausa:', error);
      this.updateState({ 
        hasError: true, 
        isTransitioning: false,
        isInternalPause: false,
        isPlaying: false 
      });
      this.isLoopExecuting = false;
    }
  }

  /**
   * Executa loop otimizado - MELHORADO
   */
  async performLoop(): Promise<void> {
    if (!this.audioElement) {
      this.isLoopExecuting = false;
      return;
    }

    try {
      console.log('AudioPlayerService: Executando loop contínuo (sem pausa)');
      
      // Marca como transição mas mantém estado de reprodução
      this.updateState({ isTransitioning: true });
      
      // Reset imediato para o início
      this.audioElement.currentTime = 0;
      
      // Inicia reprodução sem delay
      await this.audioElement.play();
      
      console.log('AudioPlayerService: Loop contínuo concluído com sucesso');
    } catch (error) {
      // MELHORADO: Tratamento específico para AbortError
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log('AudioPlayerService: AbortError durante loop contínuo (pode ser normal)');
      } else {
        console.error('AudioPlayerService: Erro no loop:', error);
        this.updateState({ 
          hasError: true, 
          isTransitioning: false,
          isPlaying: false,
          isInternalPause: false
        });
      }
    } finally {
      this.isLoopExecuting = false;
    }
  }

  /**
   * Cancela pausa interna
   */
  private cancelInternalPause(): void {
    if (this.pauseTimeout) {
      clearTimeout(this.pauseTimeout);
      this.pauseTimeout = null;
      console.log('AudioPlayerService: Pausa interna cancelada');
    }
    if (this.state.isInternalPause) {
      this.updateState({ isInternalPause: false });
    }
    this.isLoopExecuting = false; // RESET DA FLAG
  }

  /**
   * Define a posição de reprodução
   */
  seek(time: number): void {
    if (!this.audioElement || !this.state.canPlay) return;
    
    this.audioElement.currentTime = time;
    this.updateState({ currentTime: time });
  }

  /**
   * Define o volume
   * @param volume - Volume entre 0 e 1 (já normalizado)
   */
  setVolume(volume: number): void {
    if (!this.audioElement) return;
    
    // Volume já vem normalizado entre 0 e 1
    this.audioElement.volume = Math.max(0, Math.min(1, volume));
    console.log('AudioPlayerService: Volume definido para:', volume, 'Element volume:', this.audioElement.volume);
  }

  /**
   * Define se está mudo
   */
  setMuted(muted: boolean): void {
    if (!this.audioElement) return;
    
    this.audioElement.muted = muted;
  }

  /**
   * Obtém o estado atual
   */
  getState(): AudioPlayerState {
    return { ...this.state };
  }

  /**
   * Limpa os recursos - MELHORADO
   */
  cleanup(): void {
    console.log('AudioPlayerService: Executando cleanup');
    this.cancelInternalPause();
    this.isLoopExecuting = false; // RESET DA FLAG
    // Os event listeners são removidos automaticamente quando o elemento é destruído
    this.audioElement = null;
  }
}
