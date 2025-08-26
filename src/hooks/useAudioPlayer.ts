import React from 'react';
import { AudioValidationService } from '@/services/audioValidationService';
import { AudioPreferences } from '@/services/audioPreferencesService';
import { AudioLoadingTimeoutService } from '@/services/audioLoadingTimeoutService';
import { AudioLoadingStateService, AudioLoadingState } from '@/services/audioLoadingStateService';
import { AudioEventManagerService } from '@/services/audioEventManagerService';
import { useAudioPlaybackSafe } from '@/contexts/AudioPlaybackContext';

export interface AudioPlayerState {
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  hasError: boolean;
  errorMessage?: string;
  canPlay: boolean;
  isReady: boolean;
  isTransitioning: boolean;
  isInternalPause: boolean;
  autoplayBlocked?: boolean;
}

export const useAudioPlayer = (
  audioUrl: string,
  preferences: AudioPreferences,
  onRepeatComplete?: () => void,
  onError?: (error: string) => void
) => {
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [retryCount, setRetryCount] = React.useState(0);
  const [repeatCount, setRepeatCount] = React.useState(0);
  const [pauseBetweenRepeats, setPauseBetweenRepeats] = React.useState(0);
  const [isValidatingUrl, setIsValidatingUrl] = React.useState(false);
  const retryTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const stableAudioUrlRef = React.useRef<string>('');
  const isInitializedRef = React.useRef<boolean>(false);
  const maxRetries = 3;

  // Integração com contexto de música de fundo
  const audioPlaybackContext = useAudioPlaybackSafe();
  const setMainAudioPlaying = audioPlaybackContext?.setMainAudioPlaying;

  // Estado interno usando o serviço
  const [loadingState, setLoadingState] = React.useState<AudioLoadingState>(
    AudioLoadingStateService.createInitialState()
  );

  // Estado público do player
  const [playerState, setPlayerState] = React.useState<AudioPlayerState>({
    isPlaying: false,
    isLoading: false,
    currentTime: 0,
    duration: 0,
    hasError: false,
    canPlay: false,
    isReady: false,
    isTransitioning: false,
    isInternalPause: false,
    autoplayBlocked: false
  });

  // Sincronizar estado interno com estado público
  React.useEffect(() => {
    setPlayerState(prev => ({
      ...prev,
      isLoading: loadingState.isLoading,
      canPlay: loadingState.canPlay,
      isReady: loadingState.isReady,
      hasError: loadingState.hasError,
      errorMessage: loadingState.errorMessage
    }));
  }, [loadingState]);

  // NOVA FUNCIONALIDADE: Sincronizar volume com as preferências
  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Aplicar o volume normalizado (0-1) baseado nas preferências (0-100)
    const normalizedVolume = preferences.volume / 100;
    audio.volume = Math.max(0, Math.min(1, normalizedVolume));
    
    console.log('useAudioPlayer: Volume sincronizado com preferências:', {
      preferencesVolume: preferences.volume,
      normalizedVolume,
      audioElementVolume: audio.volume
    });
  }, [preferences.volume]);

  const updateLoadingState = React.useCallback((updates: Partial<AudioLoadingState>) => {
    setLoadingState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleError = React.useCallback((error: string) => {
    console.error('useAudioPlayer: Erro:', error);
    AudioLoadingTimeoutService.clearTimeout(audioUrl);
    updateLoadingState(AudioLoadingStateService.markLoadingError(error));
    onError?.(error);
  }, [updateLoadingState, onError, audioUrl]);

  const handleLoadingTimeout = React.useCallback(() => {
    console.warn('useAudioPlayer: Timeout de carregamento atingido');
    const audio = audioRef.current;
    
    if (audio && audio.readyState >= 1) { // HAVE_METADATA
      console.log('useAudioPlayer: Forçando saída do loading baseado em readyState:', audio.readyState);
      updateLoadingState(AudioLoadingStateService.markLoadingComplete(audio.duration));
      setPlayerState(prev => ({ ...prev, duration: audio.duration }));
      return;
    }
    
    handleError('Timeout: O áudio demorou muito para carregar. Verifique sua conexão.');
  }, [handleError, updateLoadingState]);

  const retryInitialization = React.useCallback(async () => {
    if (retryCount >= maxRetries) {
      handleError('Máximo de tentativas excedido. Use o diagnóstico para mais detalhes.');
      return;
    }

    console.log(`useAudioPlayer: Tentativa ${retryCount + 1}/${maxRetries}`);
    setRetryCount(prev => prev + 1);
    
    updateLoadingState(AudioLoadingStateService.markLoadingStart(audioUrl));

    const delay = Math.pow(2, retryCount) * 1000;
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    retryTimeoutRef.current = setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.load();
        AudioLoadingTimeoutService.startTimeout(audioUrl, {
          timeoutMs: 5000, // Timeout mais agressivo
          onTimeout: handleLoadingTimeout,
          onSuccess: () => console.log('Carregamento bem-sucedido')
        });
      }
    }, delay);
  }, [retryCount, maxRetries, handleError, updateLoadingState, audioUrl, handleLoadingTimeout]);

  const validateAudioUrl = React.useCallback(async () => {
    setIsValidatingUrl(true);
    try {
      const validation = await AudioValidationService.validateAudioUrl(audioUrl);
      if (!validation.isValid) {
        handleError(`URL inválida: ${validation.error}`);
        return false;
      }
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro na validação';
      handleError(`Erro de validação: ${errorMessage}`);
      return false;
    } finally {
      setIsValidatingUrl(false);
    }
  }, [audioUrl, handleError]);

  const togglePlay = React.useCallback(async () => {
    if (!audioRef.current || !loadingState.canPlay) {
      console.warn('useAudioPlayer: togglePlay bloqueado - elemento ou canPlay inválido');
      return;
    }

    try {
      console.log('useAudioPlayer: Executando togglePlay', {
        isPlaying: playerState.isPlaying,
        paused: audioRef.current.paused
      });

      if (playerState.isPlaying) {
        audioRef.current.pause();
      } else {
        setPlayerState(prev => ({ ...prev, autoplayBlocked: false }));
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('useAudioPlayer: Erro no togglePlay:', error);
      
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        setPlayerState(prev => ({ 
          ...prev,
          autoplayBlocked: true,
          hasError: true,
          errorMessage: 'Clique no botão play para iniciar (política do navegador)'
        }));
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Erro ao reproduzir';
        handleError(errorMessage);
      }
    }
  }, [loadingState.canPlay, playerState.isPlaying, handleError]);

  const reset = React.useCallback(() => {
    if (!audioRef.current) return;
    
    console.log('useAudioPlayer: Resetando áudio');
    audioRef.current.currentTime = 0;
    setRepeatCount(0);
    setPlayerState(prev => ({ 
      ...prev, 
      currentTime: 0, 
      isTransitioning: false,
      isInternalPause: false,
      autoplayBlocked: false
    }));
  }, []);

  const seek = React.useCallback((time: number) => {
    if (!audioRef.current || !loadingState.canPlay) return;
    
    audioRef.current.currentTime = time;
    setPlayerState(prev => ({ ...prev, currentTime: time }));
  }, [loadingState.canPlay]);

  const setMuted = React.useCallback((muted: boolean) => {
    if (!audioRef.current) return;
    audioRef.current.muted = muted;
  }, []);

  // Configurar áudio e event listeners - ESTABILIZADO
  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio || stableAudioUrlRef.current === audioUrl) return;

    console.log('useAudioPlayer: Configurando áudio para nova URL:', audioUrl.substring(0, 50) + '...');
    
    // Marcar URL como estável para evitar re-renders
    stableAudioUrlRef.current = audioUrl;
    isInitializedRef.current = true;

    // Reset estados
    setRetryCount(0);
    setRepeatCount(0);
    AudioLoadingStateService.resetRenderCount(audioUrl);
    updateLoadingState(AudioLoadingStateService.createInitialState());

    // Configurar handlers de eventos
    const eventHandlers = {
      onLoadStart: () => {
        updateLoadingState(AudioLoadingStateService.markLoadingStart(audioUrl));
        AudioLoadingTimeoutService.startTimeout(audioUrl, {
          timeoutMs: 5000,
          onTimeout: handleLoadingTimeout,
          onSuccess: () => console.log('Carregamento bem-sucedido')
        });
      },
      
      onLoadedMetadata: (duration: number) => {
        AudioLoadingTimeoutService.markSuccess(audioUrl);
        updateLoadingState(AudioLoadingStateService.markLoadingComplete(duration));
        setPlayerState(prev => ({ ...prev, duration }));
      },
      
      onCanPlay: () => {
        AudioLoadingTimeoutService.markSuccess(audioUrl);
        updateLoadingState(AudioLoadingStateService.markLoadingComplete(audio.duration));
        setPlayerState(prev => ({ ...prev, duration: audio.duration }));
      },
      
      onError: (error: string) => {
        if (retryCount < maxRetries) {
          console.log('useAudioPlayer: Tentando retry automático');
          retryInitialization();
        } else {
          handleError(error);
        }
      },
      
      onTimeUpdate: (currentTime: number) => {
        if (!playerState.isTransitioning && !playerState.isInternalPause) {
          setPlayerState(prev => ({ ...prev, currentTime }));
        }
      },
      
      onPlay: () => {
        console.log('useAudioPlayer: Audio iniciou - notificando contexto de música de fundo');
        setPlayerState(prev => ({ 
          ...prev,
          isPlaying: true, 
          isTransitioning: false, 
          isInternalPause: false,
          autoplayBlocked: false
        }));
        // Notificar contexto que áudio principal está tocando
        setMainAudioPlaying?.(true);
      },
      
      onPause: () => {
        if (!playerState.isInternalPause && !playerState.isTransitioning) {
          console.log('useAudioPlayer: Audio pausou - notificando contexto de música de fundo');
          setPlayerState(prev => ({ ...prev, isPlaying: false }));
          // Notificar contexto que áudio principal pausou
          setMainAudioPlaying?.(false);
        }
      },
      
      onEnded: () => {
        console.log('useAudioPlayer: Audio terminou - notificando contexto de música de fundo');
        const pauseTime = (preferences as any).pauseBetweenRepeats || 0;
        
        if (preferences.repeatCount === 0 || repeatCount < preferences.repeatCount) {
          setRepeatCount(prev => prev + 1);
          setPauseBetweenRepeats(pauseTime);
          
          if (pauseTime > 0) {
            setPlayerState(prev => ({ 
              ...prev,
              isTransitioning: true,
              isInternalPause: true,
              isPlaying: true
            }));
            
            setTimeout(() => {
              if (audio) {
                audio.currentTime = 0;
                audio.play().catch(error => {
                  console.error('useAudioPlayer: Erro no loop após pausa:', error);
                  if (error instanceof DOMException && error.name === 'NotAllowedError') {
                    setPlayerState(prev => ({ ...prev, autoplayBlocked: true }));
                  }
                });
                setPlayerState(prev => ({ 
                  ...prev,
                  isTransitioning: false,
                  isInternalPause: false 
                }));
              }
            }, pauseTime * 1000);
          } else {
            audio.currentTime = 0;
            audio.play().catch(error => {
              console.error('useAudioPlayer: Erro no loop imediato:', error);
              if (error instanceof DOMException && error.name === 'NotAllowedError') {
                setPlayerState(prev => ({ ...prev, autoplayBlocked: true }));
              }
            });
          }
          
          onRepeatComplete?.();
        } else {
          setPlayerState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
          // Notificar contexto que áudio principal terminou completamente
          setMainAudioPlaying?.(false);
        }
      }
    };

    // Adicionar event listeners usando o serviço
    AudioEventManagerService.addEventListeners(audio, audioUrl, eventHandlers);

    // Configurar áudio
    audio.volume = preferences.volume / 100;
    audio.preload = 'metadata';
    audio.src = audioUrl;
    audio.load();

    // Cleanup
    return () => {
      AudioLoadingTimeoutService.clearTimeout(audioUrl);
      AudioEventManagerService.removeEventListeners(audioUrl);
    };
  }, [audioUrl, setMainAudioPlaying]);

  // Verificação de timeout periódica
  React.useEffect(() => {
    if (!loadingState.isLoading) return;

    const timeoutCheck = setInterval(() => {
      if (AudioLoadingStateService.shouldForceLoadingComplete(loadingState)) {
        const audio = audioRef.current;
        if (audio && audio.readyState >= 1) {
          updateLoadingState(AudioLoadingStateService.markLoadingComplete(audio.duration));
          setPlayerState(prev => ({ ...prev, duration: audio.duration }));
        } else {
          handleError('Timeout: Áudio não carregou após 5 segundos');
        }
      }
    }, 1000);

    return () => clearInterval(timeoutCheck);
  }, [loadingState.isLoading, loadingState.loadingStartTime, updateLoadingState, handleError]);

  // Cleanup geral
  React.useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      AudioLoadingTimeoutService.clearAllTimeouts();
      AudioLoadingStateService.clearAllCounters();
      AudioEventManagerService.clearAllElements();
    };
  }, []);

  return {
    audioRef,
    playerState,
    repeatCount,
    pauseBetweenRepeats,
    retryCount,
    isValidatingUrl,
    togglePlay,
    reset,
    seek,
    setMuted,
    validateAudioUrl,
    retryInitialization
  };
};
