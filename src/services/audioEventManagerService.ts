
/**
 * Audio Event Manager Service
 * Responsabilidade: Gerenciar eventos do elemento HTML Audio
 * Princípio SRP: Apenas lógica de eventos de áudio
 * Princípio DRY: Centraliza lógica de eventos reutilizável
 */

export interface AudioEventHandlers {
  onLoadStart: () => void;
  onLoadedMetadata: (duration: number) => void;
  onCanPlay: () => void;
  onError: (error: string) => void;
  onTimeUpdate: (currentTime: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onEnded: () => void;
}

export class AudioEventManagerService {
  private static activeElements = new Map<string, HTMLAudioElement>();

  /**
   * Adiciona event listeners ao elemento de áudio
   */
  static addEventListeners(
    audioElement: HTMLAudioElement,
    audioUrl: string,
    handlers: AudioEventHandlers
  ): void {
    // Remover listeners existentes primeiro
    this.removeEventListeners(audioUrl);

    console.log('🎧 EventManager: Adicionando event listeners para', audioUrl.substring(0, 50) + '...');

    const handleLoadStart = () => {
      console.log('📥 EventManager: loadstart disparado');
      handlers.onLoadStart();
    };

    const handleLoadedMetadata = () => {
      console.log('📊 EventManager: loadedmetadata disparado', {
        duration: audioElement.duration,
        readyState: audioElement.readyState
      });
      handlers.onLoadedMetadata(audioElement.duration);
    };

    const handleLoadedData = () => {
      console.log('📦 EventManager: loadeddata disparado (fallback)');
      // Fallback se loadedmetadata não disparou
      if (audioElement.duration > 0) {
        handlers.onLoadedMetadata(audioElement.duration);
      }
    };

    const handleCanPlay = () => {
      console.log('✅ EventManager: canplay disparado');
      handlers.onCanPlay();
    };

    const handleTimeUpdate = () => {
      handlers.onTimeUpdate(audioElement.currentTime);
    };

    const handlePlay = () => {
      console.log('▶️ EventManager: play disparado');
      handlers.onPlay();
    };

    const handlePause = () => {
      console.log('⏸️ EventManager: pause disparado');
      handlers.onPause();
    };

    const handleEnded = () => {
      console.log('🏁 EventManager: ended disparado');
      handlers.onEnded();
    };

    const handleError = () => {
      const error = audioElement.error;
      const errorMessage = error 
        ? `Erro ${error.code}: ${this.getErrorMessage(error.code)}`
        : 'Erro desconhecido no áudio';
      
      console.error('🚨 EventManager: error disparado', { error, errorMessage });
      handlers.onError(errorMessage);
    };

    // Adicionar todos os listeners
    audioElement.addEventListener('loadstart', handleLoadStart);
    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    audioElement.addEventListener('loadeddata', handleLoadedData);
    audioElement.addEventListener('canplay', handleCanPlay);
    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.addEventListener('play', handlePlay);
    audioElement.addEventListener('pause', handlePause);
    audioElement.addEventListener('ended', handleEnded);
    audioElement.addEventListener('error', handleError);

    // Armazenar referência para cleanup
    this.activeElements.set(audioUrl, audioElement);

    // Implementar verificação de readyState como fallback
    this.setupReadyStateMonitor(audioElement, audioUrl, handlers);
  }

  /**
   * Remove event listeners do elemento de áudio
   */
  static removeEventListeners(audioUrl: string): void {
    const element = this.activeElements.get(audioUrl);
    if (!element) return;

    console.log('🗑️ EventManager: Removendo event listeners para', audioUrl.substring(0, 50) + '...');

    // Remover todos os listeners (usando removeEventListener requer as mesmas funções, 
    // então vamos usar a abordagem mais simples de clonagem do elemento)
    const newElement = element.cloneNode(true) as HTMLAudioElement;
    element.parentNode?.replaceChild(newElement, element);

    this.activeElements.delete(audioUrl);
  }

  /**
   * Monitora readyState como fallback para eventos que não disparam
   */
  private static setupReadyStateMonitor(
    audioElement: HTMLAudioElement,
    audioUrl: string,
    handlers: AudioEventHandlers
  ): void {
    let monitoringActive = true;
    let lastReadyState = audioElement.readyState;

    const monitor = () => {
      if (!monitoringActive || !this.activeElements.has(audioUrl)) return;

      const currentReadyState = audioElement.readyState;
      
      // Se readyState mudou, logar
      if (currentReadyState !== lastReadyState) {
        console.log(`📡 EventManager: ReadyState mudou de ${lastReadyState} para ${currentReadyState}`);
        lastReadyState = currentReadyState;
      }

      // Fallback: Se temos metadata mas evento não disparou
      if (currentReadyState >= 1 && audioElement.duration > 0) { // HAVE_METADATA
        console.log('🔄 EventManager: Fallback - forçando loadedmetadata baseado em readyState');
        handlers.onLoadedMetadata(audioElement.duration);
        monitoringActive = false;
        return;
      }

      // Fallback: Se pode reproduzir mas evento não disparou
      if (currentReadyState >= 3) { // CAN_PLAY
        console.log('🔄 EventManager: Fallback - forçando canplay baseado em readyState');
        handlers.onCanPlay();
        monitoringActive = false;
        return;
      }

      // Continuar monitorando
      setTimeout(monitor, 500);
    };

    // Iniciar monitoramento após um delay
    setTimeout(monitor, 1000);
  }

  /**
   * Traduz códigos de erro para mensagens legíveis
   */
  private static getErrorMessage(errorCode: number): string {
    const errorMessages: Record<number, string> = {
      1: 'MEDIA_ERR_ABORTED - Download abortado',
      2: 'MEDIA_ERR_NETWORK - Erro de rede',
      3: 'MEDIA_ERR_DECODE - Erro de decodificação',
      4: 'MEDIA_ERR_SRC_NOT_SUPPORTED - Formato não suportado'
    };

    return errorMessages[errorCode] || `Código de erro desconhecido: ${errorCode}`;
  }

  /**
   * Limpa todos os elementos ativos
   */
  static clearAllElements(): void {
    console.log('🧹 EventManager: Limpando todos os elementos ativos');
    this.activeElements.clear();
  }
}
