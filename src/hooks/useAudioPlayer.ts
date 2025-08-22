
import { useState, useEffect, useRef, useCallback } from 'react';
import { AudioValidationService } from '@/services/audioValidationService';
import { AudioPreferences } from '@/services/audioPreferencesService';

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
  const audioRef = useRef<HTMLAudioElement>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [repeatCount, setRepeatCount] = useState(0);
  const [pauseBetweenRepeats, setPauseBetweenRepeats] = useState(0);
  const [isValidatingUrl, setIsValidatingUrl] = useState(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxRetries = 3;

  const [playerState, setPlayerState] = useState<AudioPlayerState>({
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

  const updateState = useCallback((updates: Partial<AudioPlayerState>) => {
    setPlayerState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleError = useCallback((error: string) => {
    console.error('useAudioPlayer: Erro:', error);
    updateState({
      hasError: true,
      errorMessage: error,
      isLoading: false,
      isReady: false,
      canPlay: false
    });
    onError?.(error);
  }, [updateState, onError]);

  const retryInitialization = useCallback(async () => {
    if (retryCount >= maxRetries) {
      handleError('Máximo de tentativas excedido. Use o diagnóstico para mais detalhes.');
      return;
    }

    console.log(`useAudioPlayer: Tentativa ${retryCount + 1}/${maxRetries}`);
    setRetryCount(prev => prev + 1);
    
    updateState({
      isLoading: true,
      hasError: false,
      errorMessage: undefined,
      autoplayBlocked: false
    });

    // Delay exponencial: 1s, 2s, 4s
    const delay = Math.pow(2, retryCount) * 1000;
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    retryTimeoutRef.current = setTimeout(async () => {
      if (audioRef.current) {
        audioRef.current.load();
      }
    }, delay);
  }, [retryCount, maxRetries, handleError, updateState]);

  const validateAudioUrl = useCallback(async () => {
    setIsValidatingUrl(true);
    try {
      const validation = await AudioValidationService.validateAudioUrl(audioUrl);
      if (!validation.isValid) {
        handleError(`URL inválida: ${validation.error}`);
        return false;
      }

      const connectivity = await AudioValidationService.testSupabaseConnectivity();
      if (!connectivity.isValid) {
        console.warn('useAudioPlayer: Problemas de conectividade:', connectivity.error);
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

  const togglePlay = useCallback(async () => {
    if (!audioRef.current || !playerState.canPlay) {
      console.warn('useAudioPlayer: togglePlay bloqueado - elemento ou canPlay inválido');
      return;
    }

    try {
      console.log('useAudioPlayer: Executando togglePlay', {
        isPlaying: playerState.isPlaying,
        paused: audioRef.current.paused,
        readyState: audioRef.current.readyState
      });

      if (playerState.isPlaying) {
        console.log('useAudioPlayer: Pausando áudio');
        audioRef.current.pause();
      } else {
        console.log('useAudioPlayer: Iniciando reprodução');
        
        // Reset autoplay blocked flag
        updateState({ autoplayBlocked: false });
        
        await audioRef.current.play();
        console.log('useAudioPlayer: Play bem-sucedido');
      }
    } catch (error) {
      console.error('useAudioPlayer: Erro no togglePlay:', error);
      
      // Tratamento específico para diferentes tipos de erro
      if (error instanceof DOMException) {
        switch (error.name) {
          case 'NotAllowedError':
            console.warn('useAudioPlayer: Autoplay bloqueado pelo navegador');
            updateState({ 
              autoplayBlocked: true,
              hasError: true,
              errorMessage: 'Clique no botão play para iniciar (política do navegador)'
            });
            break;
          case 'AbortError':
            console.warn('useAudioPlayer: Reprodução abortada (pode ser normal)');
            // Não trata como erro fatal
            break;
          case 'NotSupportedError':
            handleError('Formato de áudio não suportado pelo navegador');
            break;
          default:
            handleError(`Erro de reprodução: ${error.message}`);
        }
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Erro ao reproduzir';
        handleError(errorMessage);
      }
    }
  }, [playerState.canPlay, playerState.isPlaying, handleError, updateState]);

  const reset = useCallback(() => {
    if (!audioRef.current) return;
    
    console.log('useAudioPlayer: Resetando áudio');
    audioRef.current.currentTime = 0;
    setRepeatCount(0);
    updateState({ 
      currentTime: 0, 
      isTransitioning: false,
      isInternalPause: false,
      autoplayBlocked: false
    });
  }, [updateState]);

  const seek = useCallback((time: number) => {
    if (!audioRef.current || !playerState.canPlay) return;
    
    audioRef.current.currentTime = time;
    updateState({ currentTime: time });
  }, [playerState.canPlay, updateState]);

  const setMuted = useCallback((muted: boolean) => {
    if (!audioRef.current) return;
    audioRef.current.muted = muted;
  }, []);

  // Setup event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadStart = () => {
      console.log('useAudioPlayer: Iniciando carregamento');
      updateState({ isLoading: true, hasError: false, autoplayBlocked: false });
    };

    const handleLoadedMetadata = () => {
      console.log('useAudioPlayer: Metadata carregada', {
        duration: audio.duration,
        readyState: audio.readyState
      });
      updateState({ 
        duration: audio.duration,
        isLoading: false,
        canPlay: true,
        isReady: true
      });
    };

    const handleCanPlay = () => {
      console.log('useAudioPlayer: Áudio pronto para reprodução');
      updateState({ canPlay: true, isLoading: false, isReady: true });
    };

    const handleTimeUpdate = () => {
      if (!playerState.isTransitioning && !playerState.isInternalPause) {
        updateState({ currentTime: audio.currentTime });
      }
    };

    const handlePlay = () => {
      console.log('useAudioPlayer: Evento play disparado');
      updateState({ 
        isPlaying: true, 
        isTransitioning: false, 
        isInternalPause: false,
        autoplayBlocked: false
      });
    };

    const handlePause = () => {
      console.log('useAudioPlayer: Evento pause disparado', {
        isInternalPause: playerState.isInternalPause,
        isTransitioning: playerState.isTransitioning
      });
      if (!playerState.isInternalPause && !playerState.isTransitioning) {
        updateState({ isPlaying: false });
      }
    };

    const handleEnded = () => {
      console.log('useAudioPlayer: Áudio terminou');
      
      // Usamos um valor padrão de 0 para pauseBetweenRepeats se não existir nas preferências
      const pauseTime = (preferences as any).pauseBetweenRepeats || 0;
      
      if (preferences.repeatCount === 0 || repeatCount < preferences.repeatCount) {
        setRepeatCount(prev => prev + 1);
        setPauseBetweenRepeats(pauseTime);
        
        if (pauseTime > 0) {
          updateState({ 
            isTransitioning: true,
            isInternalPause: true,
            isPlaying: true // Mantém isPlaying durante pausa interna
          });
          
          setTimeout(() => {
            if (audio) {
              audio.currentTime = 0;
              audio.play().catch(error => {
                console.error('useAudioPlayer: Erro no loop após pausa:', error);
                if (error instanceof DOMException && error.name === 'NotAllowedError') {
                  updateState({ autoplayBlocked: true });
                }
              });
              updateState({ 
                isTransitioning: false,
                isInternalPause: false 
              });
            }
          }, pauseTime * 1000);
        } else {
          // Loop imediato
          audio.currentTime = 0;
          audio.play().catch(error => {
            console.error('useAudioPlayer: Erro no loop imediato:', error);
            if (error instanceof DOMException && error.name === 'NotAllowedError') {
              updateState({ autoplayBlocked: true });
            }
          });
        }
        
        onRepeatComplete?.();
      } else {
        updateState({ isPlaying: false, currentTime: 0 });
      }
    };

    const handleAudioError = (e: Event) => {
      console.error('useAudioPlayer: Erro no elemento áudio:', e);
      
      if (retryCount < maxRetries) {
        console.log('useAudioPlayer: Tentando retry automático');
        retryInitialization();
      } else {
        handleError('Não foi possível carregar o áudio. Use o diagnóstico para mais detalhes.');
      }
    };

    // Add event listeners
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleAudioError);

    // Apply preferences
    audio.volume = preferences.volume / 100;
    audio.preload = 'auto';
    
    // Remover crossOrigin se estiver causando problemas CORS
    // audio.crossOrigin = 'anonymous';

    // Load audio
    audio.src = audioUrl;
    audio.load();

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleAudioError);
    };
  }, [audioUrl, preferences, repeatCount, retryCount, playerState.isTransitioning, playerState.isInternalPause, updateState, onRepeatComplete, retryInitialization]);

  // Reset retry count when URL changes
  useEffect(() => {
    setRetryCount(0);
    setRepeatCount(0);
  }, [audioUrl]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
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
