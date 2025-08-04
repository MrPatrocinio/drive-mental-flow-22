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
}

export interface AudioPlayerEvents {
  onStateChange: (state: AudioPlayerState) => void;
  onRepeatComplete?: () => void;
  onError?: (error: string) => void;
}

export class AudioPlayerService {
  private audioElement: HTMLAudioElement | null = null;
  private events: AudioPlayerEvents;
  private state: AudioPlayerState = {
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    isLoading: false,
    hasError: false,
    canPlay: false
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
      this.updateState({ isLoading: true, hasError: false });
    });

    audio.addEventListener('loadedmetadata', () => {
      this.updateState({ 
        duration: audio.duration,
        isLoading: false,
        canPlay: true 
      });
    });

    audio.addEventListener('canplay', () => {
      this.updateState({ canPlay: true, isLoading: false });
    });

    // Eventos de reprodução
    audio.addEventListener('timeupdate', () => {
      this.updateState({ currentTime: audio.currentTime });
    });

    audio.addEventListener('play', () => {
      this.updateState({ isPlaying: true });
    });

    audio.addEventListener('pause', () => {
      this.updateState({ isPlaying: false });
    });

    audio.addEventListener('ended', () => {
      this.updateState({ isPlaying: false });
      this.events.onRepeatComplete?.();
    });

    // Eventos de erro
    audio.addEventListener('error', (e) => {
      const errorMessage = this.getAudioErrorMessage(audio.error);
      this.updateState({ 
        hasError: true, 
        isLoading: false,
        errorMessage,
        canPlay: false 
      });
      this.events.onError?.(errorMessage);
    });

    audio.addEventListener('stalled', () => {
      this.updateState({ 
        hasError: true, 
        errorMessage: 'Reprodução interrompida - problema de conexão',
        isLoading: false 
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

    try {
      if (this.state.isPlaying) {
        this.audioElement.pause();
      } else {
        await this.audioElement.play();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao reproduzir áudio';
      this.updateState({ 
        hasError: true, 
        errorMessage,
        isPlaying: false 
      });
      this.events.onError?.(errorMessage);
    }
  }

  /**
   * Redefine o áudio para o início
   */
  reset(): void {
    if (!this.audioElement) return;
    
    this.audioElement.currentTime = 0;
    this.updateState({ currentTime: 0 });
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
    // Os event listeners são removidos automaticamente quando o elemento é destruído
    this.audioElement = null;
  }
}