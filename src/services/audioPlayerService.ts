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
  isPausedBetweenRepeats: boolean; // Novo estado para pausa entre repetições
}

export interface AudioPlayerEvents {
  onStateChange: (state: AudioPlayerState) => void;
  onRepeatComplete?: () => void;
  onError?: (error: string) => void;
}

export class AudioPlayerService {
  private audioElement: HTMLAudioElement | null = null;
  private events: AudioPlayerEvents;
  private pauseTimeout: NodeJS.Timeout | null = null; // Controle da pausa
  private state: AudioPlayerState = {
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    isLoading: false,
    hasError: false,
    canPlay: false,
    isTransitioning: false,
    isPausedBetweenRepeats: false
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
      if (!this.state.isTransitioning && !this.state.isPausedBetweenRepeats) {
        this.updateState({ currentTime: audio.currentTime });
      }
    });

    audio.addEventListener('play', () => {
      console.log('AudioPlayerService: Reprodução iniciada');
      this.updateState({ isPlaying: true, isTransitioning: false, isPausedBetweenRepeats: false });
    });

    audio.addEventListener('pause', () => {
      // Só atualiza isPlaying se não está em transição ou pausa entre repetições
      if (!this.state.isTransitioning && !this.state.isPausedBetweenRepeats) {
        console.log('AudioPlayerService: Reprodução pausada');
        this.updateState({ isPlaying: false });
      }
    });

    audio.addEventListener('ended', () => {
      console.log('AudioPlayerService: Áudio terminou - iniciando transição de loop');
      // Marca como transição para evitar mudanças de estado desnecessárias
      this.updateState({ isTransitioning: true });
      this.events.onRepeatComplete?.();
    });

    // Eventos de erro
    audio.addEventListener('error', (e) => {
      const errorMessage = this.getAudioErrorMessage(audio.error);
      console.error('AudioPlayerService: Erro no áudio:', errorMessage);
      this.updateState({ 
        hasError: true, 
        isLoading: false,
        errorMessage,
        canPlay: false,
        isTransitioning: false,
        isPausedBetweenRepeats: false
      });
      this.events.onError?.(errorMessage);
    });

    audio.addEventListener('stalled', () => {
      console.warn('AudioPlayerService: Reprodução travada');
      this.updateState({ 
        hasError: true, 
        errorMessage: 'Reprodução interrompida - problema de conexão',
        isLoading: false,
        isTransitioning: false,
        isPausedBetweenRepeats: false
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

    // Cancela pausa se usuário tentar reproduzir durante a pausa
    if (this.state.isPausedBetweenRepeats) {
      this.cancelPauseBetweenRepeats();
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
      const errorMessage = error instanceof Error ? error.message : 'Erro ao reproduzir áudio';
      console.error('AudioPlayerService: Erro no togglePlay:', errorMessage);
      this.updateState({ 
        hasError: true, 
        errorMessage,
        isPlaying: false,
        isTransitioning: false,
        isPausedBetweenRepeats: false
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
    this.cancelPauseBetweenRepeats();
    this.audioElement.currentTime = 0;
    this.updateState({ 
      currentTime: 0, 
      isTransitioning: false,
      isPausedBetweenRepeats: false
    });
  }

  /**
   * Executa loop com pausa configurável (novo método)
   * Princípio SRP: responsabilidade específica para loop com pausa
   */
  async performLoopWithPause(pauseSeconds: number): Promise<void> {
    if (!this.audioElement) return;

    try {
      console.log(`AudioPlayerService: Executando loop com pausa de ${pauseSeconds} segundos`);
      
      // Marca como em pausa entre repetições
      this.updateState({ 
        isTransitioning: false,
        isPausedBetweenRepeats: true,
        isPlaying: false
      });
      
      // Aguarda o tempo de pausa configurado
      this.pauseTimeout = setTimeout(async () => {
        if (!this.audioElement) return;
        
        try {
          // Reset para o início
          this.audioElement.currentTime = 0;
          
          // Inicia reprodução
          await this.audioElement.play();
          
          console.log('AudioPlayerService: Loop após pausa concluído com sucesso');
        } catch (error) {
          console.error('AudioPlayerService: Erro no loop após pausa:', error);
          this.updateState({ 
            hasError: true, 
            isTransitioning: false,
            isPausedBetweenRepeats: false,
            isPlaying: false 
          });
        }
      }, pauseSeconds * 1000);
      
    } catch (error) {
      console.error('AudioPlayerService: Erro no loop com pausa:', error);
      this.updateState({ 
        hasError: true, 
        isTransitioning: false,
        isPausedBetweenRepeats: false,
        isPlaying: false 
      });
    }
  }

  /**
   * Executa loop otimizado (sem pausar o estado de reprodução)
   * Mantido para compatibilidade com repetição imediata
   */
  async performLoop(): Promise<void> {
    if (!this.audioElement) return;

    try {
      console.log('AudioPlayerService: Executando loop otimizado (sem pausa)');
      // Não marca como não tocando durante o loop
      this.updateState({ isTransitioning: true });
      
      // Reset imediato para o início
      this.audioElement.currentTime = 0;
      
      // Inicia reprodução sem delay
      await this.audioElement.play();
      
      console.log('AudioPlayerService: Loop concluído com sucesso');
    } catch (error) {
      console.error('AudioPlayerService: Erro no loop:', error);
      this.updateState({ 
        hasError: true, 
        isTransitioning: false,
        isPlaying: false,
        isPausedBetweenRepeats: false
      });
    }
  }

  /**
   * Cancela pausa entre repetições
   */
  private cancelPauseBetweenRepeats(): void {
    if (this.pauseTimeout) {
      clearTimeout(this.pauseTimeout);
      this.pauseTimeout = null;
      console.log('AudioPlayerService: Pausa entre repetições cancelada');
    }
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
   * Limpa os recursos
   */
  cleanup(): void {
    this.cancelPauseBetweenRepeats();
    // Os event listeners são removidos automaticamente quando o elemento é destruído
    this.audioElement = null;
  }
}
