
import { useState, useEffect, useRef, useCallback } from 'react';
import { AudioValidationService } from '@/services/audioValidationService';
import { AudioPreferences } from '@/services/audioPreferencesService';
import { AudioLoadingTimeoutService } from '@/services/audioLoadingTimeoutService';

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
  const loadingEventsRef = useRef<Set<string>>(new Set());
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
    AudioLoadingTimeoutService.clearTimeout(audioUrl);
    updateState({
      hasError: true,
      errorMessage: error,
      isLoading: false,
      isReady: false,
      canPlay: false
    });
    onError?.(error);
  }, [updateState, onError, audioUrl]);

  const handleLoadingTimeout = useCallback(() => {
    console.warn('useAudioPlayer: Timeout de carregamento atingido');
    const audio = audioRef.current;
    
    if (audio) {
      console.log('useAudioPlayer: Estado no timeout:', {
        readyState: audio.readyState,
        networkState: audio.networkState,
        currentSrc: audio.currentSrc,
        error: audio.error
      });
      
      // Verificar se já temos dados suficientes mesmo sem os eventos
      if (audio.readyState >= 2) { // HAVE_CURRENT_DATA
        console.log('useAudioPlayer: Forçando saída do loading baseado em readyState');
        updateState({
          isLoading: false,
          canPlay: true,
          isReady: true,
          duration: audio.duration || 0
        });
        return;
      }
    }
    
    handleError('Timeout: O áudio demorou muito para carregar. Verifique sua conexão.');
  }, [handleError, updateState]);

  const startLoadingTimeout = useCallback(() => {
    AudioLoadingTimeoutService.startTimeout(audioUrl, {
      timeoutMs: 15000,
      onTimeout: handleLoadingTimeout,
      onSuccess: () => {
        console.log('useAudioPlayer: Carregamento bem-sucedido dentro do timeout');
      }
    });
  }, [audioUrl, handleLoadingTimeout]);

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

    // Limpar eventos registrados
    loadingEventsRef.current.clear();

    // Delay exponencial: 1s, 2s, 4s
    const delay = Math.pow(2, retryCount) * 1000;
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    retryTimeoutRef.current = setTimeout(async () => {
      if (audioRef.current) {
        audioRef.current.load();
        startLoadingTimeout();
      }
    }, delay);
  }, [retryCount, maxRetries, handleError, updateState, startLoadingTimeout]);

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
      console.log('useAudioPlayer: 📥 loadstart - Iniciando carregamento');
      loadingEventsRef.current.add('loadstart');
      updateState({ isLoading: true, hasError: false, autoplayBlocked: false });
      startLoadingTimeout();
    };

    const handleLoadedMetadata = () => {
      console.log('useAudioPlayer: 📊 loadedmetadata - Metadata carregada', {
        duration: audio.duration,
        readyState: audio.readyState
      });
      loadingEventsRef.current.add('loadedmetadata');
      
      AudioLoadingTimeoutService.markSuccess(audioUrl);
      updateState({ 
        duration: audio.duration,
        isLoading: false,
        canPlay: true,
        isReady: true
      });
    };

    const handleLoadedData = () => {
      console.log('useAudioPlayer: 📦 loadeddata - Dados carregados (fallback)');
      loadingEventsRef.current.add('loadeddata');
      
      // Fallback se loadedmetadata não disparou
      if (!loadingEventsRef.current.has('loadedmetadata')) {
        console.log('useAudioPlayer: Usando loadeddata como fallback');
        AudioLoadingTimeoutService.markSuccess(audioUrl);
        updateState({ 
          duration: audio.duration,
          isLoading: false,
          canPlay: true,
          isReady: true
        });
      }
    };

    const handleCanPlay = () => {
      console.log('useAudioPlayer: ✅ canplay - Áudio pronto para reprodução');
      loadingEventsRef.current.add('canplay');
      
      // Garantir que saímos do loading se ainda não saímos
      AudioLoadingTimeoutService.markSuccess(audioUrl);
      updateState({ canPlay: true, isLoading: false, isReady: true });
    };

    const handleTimeUpdate = () => {
      if (!playerState.isTransitioning && !playerState.isInternalPause) {
        updateState({ currentTime: audio.currentTime });
      }
    };

    const handlePlay = () => {
      console.log('useAudioPlayer: ▶️ play - Evento play disparado');
      updateState({ 
        isPlaying: true, 
        isTransitioning: false, 
        isInternalPause: false,
        autoplayBlocked: false
      });
    };

    const handlePause = () => {
      console.log('useAudioPlayer: ⏸️ pause - Evento pause disparado', {
        isInternalPause: playerState.isInternalPause,
        isTransitioning: playerState.isTransitioning
      });
      if (!playerState.isInternalPause && !playerState.isTransitioning) {
        updateState({ isPlaying: false });
      }
    };

    const handleEnded = () => {
      console.log('useAudioPlayer: 🏁 ended - Áudio terminou');
      
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
      console.error('useAudioPlayer: 🚨 error - Erro no elemento áudio:', e);
      console.log('useAudioPlayer: Eventos registrados até o erro:', Array.from(loadingEventsRef.current));
      
      AudioLoadingTimeoutService.clearTimeout(audioUrl);
      
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
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleAudioError);

    // Apply preferences
    audio.volume = preferences.volume / 100;
    audio.preload = 'metadata';

    // Load audio
    audio.src = audioUrl;
    audio.load();

    return () => {
      AudioLoadingTimeoutService.clearTimeout(audioUrl);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleAudioError);
    };
  }, [audioUrl, preferences, repeatCount, retryCount, playerState.isTransitioning, playerState.isInternalPause, updateState, onRepeatComplete, retryInitialization, startLoadingTimeout]);

  // Reset retry count when URL changes
  useEffect(() => {
    setRetryCount(0);
    setRepeatCount(0);
    loadingEventsRef.current.clear();
    AudioLoadingTimeoutService.clearTimeout(audioUrl);
  }, [audioUrl]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      AudioLoadingTimeoutService.clearAllTimeouts();
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
