import { useState, useRef, useEffect, useCallback } from 'react';
import { AudioPlayerService, AudioPlayerState } from '@/services/audioPlayerService';
import { AudioPreferences } from '@/services/audioPreferencesService';
import { AudioConfigService } from '@/services/supabase/audioConfigService';
import { AudioValidationService } from '@/services/audioValidationService';
import { useBackgroundMusic } from './useBackgroundMusic';
import { useAudioPlaybackSafe } from '@/contexts/AudioPlaybackContext';

/**
 * Hook customizado para gerenciar o estado do player de áudio
 * MELHORADO: Validação de URL e retry automático
 */
export const useAudioPlayer = (
  audioUrl: string,
  preferences: AudioPreferences,
  onRepeatComplete?: () => void,
  onError?: (error: string) => void
) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const playerServiceRef = useRef<AudioPlayerService | null>(null);
  const [playerState, setPlayerState] = useState<AudioPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    isLoading: true,
    hasError: false,
    canPlay: false,
    isTransitioning: false,
    isInternalPause: false
  });
  const [repeatCount, setRepeatCount] = useState(0);
  const [pauseBetweenRepeats, setPauseBetweenRepeats] = useState(3);
  const [isInitialized, setIsInitialized] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isValidatingUrl, setIsValidatingUrl] = useState(false);
  
  // Refs para controle de debounce e instância única
  const onRepeatCompleteRef = useRef(onRepeatComplete);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Hook para música de fundo
  const { setVolume: setBackgroundVolume, setMuted: setBackgroundMuted } = useBackgroundMusic();
  
  // Context para controlar música de fundo
  const audioPlaybackContext = useAudioPlaybackSafe();

  // Atualiza referência do callback sem recriar o serviço
  useEffect(() => {
    onRepeatCompleteRef.current = onRepeatComplete;
  }, [onRepeatComplete]);

  // Carrega configuração administrativa de pausa (SSOT)
  useEffect(() => {
    const loadAudioConfig = async () => {
      try {
        const config = await AudioConfigService.getAudioConfig();
        setPauseBetweenRepeats(config.pause_between_repeats_seconds);
        console.log('useAudioPlayer: Configuração de pausa carregada:', config.pause_between_repeats_seconds, 'segundos');
      } catch (error) {
        console.error('useAudioPlayer: Erro ao carregar configuração de pausa:', error);
        setPauseBetweenRepeats(3);
      }
    };

    loadAudioConfig();
  }, []);

  // Callback debounced para repetição
  const handleRepeatComplete = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      console.log('useAudioPlayer: Executando onRepeatComplete (debounced)');
      
      setRepeatCount(current => {
        const newCount = current + 1;
        console.log('useAudioPlayer: Incrementando contador:', newCount);
        
        if (onRepeatCompleteRef.current) {
          onRepeatCompleteRef.current();
        }
        
        const shouldContinue = preferences.repeatCount === 0 || newCount < preferences.repeatCount;
        
        if (shouldContinue && playerServiceRef.current) {
          console.log(`useAudioPlayer: Executando próxima repetição com pausa de ${pauseBetweenRepeats}s`);
          playerServiceRef.current.performLoopWithPause(pauseBetweenRepeats);
        } else {
          console.log('useAudioPlayer: Repetições concluídas');
        }
        
        return newCount;
      });
    }, 300);
  }, [preferences.repeatCount, pauseBetweenRepeats]);

  // Função para validar URL do áudio
  const validateAudioUrl = async () => {
    if (!audioUrl) return false;

    setIsValidatingUrl(true);
    console.log('useAudioPlayer: Validando URL do áudio:', audioUrl);

    try {
      // Primeiro, testar conectividade básica
      const hasConnectivity = await AudioValidationService.testStorageConnectivity();
      if (!hasConnectivity) {
        if (onError) {
          onError('Sem conexão com o servidor de áudio. Verifique sua internet.');
        }
        return false;
      }

      // Validar URL específica
      const validation = await AudioValidationService.validateAudioUrl(audioUrl);
      
      if (!validation.isValid) {
        console.error('useAudioPlayer: URL inválida:', validation.error);
        if (onError) {
          onError(validation.error || 'URL de áudio inválida');
        }
        return false;
      }

      console.log('useAudioPlayer: URL validada com sucesso');
      return true;
    } catch (error) {
      console.error('useAudioPlayer: Erro na validação:', error);
      if (onError) {
        onError('Erro ao validar áudio');
      }
      return false;
    } finally {
      setIsValidatingUrl(false);
    }
  };

  // Função de retry com backoff exponencial
  const retryInitialization = useCallback(async () => {
    if (retryCount >= 3) {
      console.log('useAudioPlayer: Máximo de tentativas atingido');
      if (onError) {
        onError('Não foi possível carregar o áudio após várias tentativas. Verifique sua conexão.');
      }
      return;
    }

    const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
    console.log(`useAudioPlayer: Tentativa ${retryCount + 1} em ${delay}ms`);

    setRetryCount(prev => prev + 1);

    retryTimeoutRef.current = setTimeout(async () => {
      // Validar URL antes de tentar novamente
      const isValidUrl = await validateAudioUrl();
      if (isValidUrl && audioRef.current) {
        console.log('useAudioPlayer: Recarregando áudio após validação');
        audioRef.current.load();
      }
    }, delay);
  }, [retryCount, audioUrl, onError]);

  // Inicializa o serviço de player - MELHORADO com validação
  useEffect(() => {
    if (!audioUrl) {
      console.log('useAudioPlayer: URL não fornecida');
      return;
    }

    console.log('useAudioPlayer: Iniciando inicialização para URL:', audioUrl);
    
    // Reset do contador de retry para nova URL
    setRetryCount(0);
    
    // Aguarda o elemento de áudio estar disponível
    const initializePlayer = () => {
      if (!audioRef.current) {
        console.log('useAudioPlayer: Elemento de áudio ainda não disponível, aguardando...');
        setTimeout(initializePlayer, 50);
        return;
      }

      console.log('useAudioPlayer: Elemento de áudio encontrado, inicializando serviço');

      // Limpa serviço anterior se existir
      if (playerServiceRef.current) {
        console.log('useAudioPlayer: Limpando serviço anterior');
        playerServiceRef.current.cleanup();
      }

      // Reset dos estados
      setRepeatCount(0);
      setIsInitialized(false);

      try {
        console.log('useAudioPlayer: Criando novo AudioPlayerService');
        
        const service = new AudioPlayerService({
          onStateChange: (newState) => {
            console.log('useAudioPlayer: Estado atualizado pelo serviço:', {
              canPlay: newState.canPlay,
              duration: newState.duration,
              isLoading: newState.isLoading,
              hasError: newState.hasError
            });
            setPlayerState(newState);
          },
          onRepeatComplete: handleRepeatComplete,
          onError: (error) => {
            console.error('useAudioPlayer: Erro no serviço:', error);
            if (onError) {
              onError(error);
            }
            // Tentar retry se for erro de rede
            if (error.toLowerCase().includes('rede') || 
                error.toLowerCase().includes('timeout') ||
                error.toLowerCase().includes('conexão')) {
              retryInitialization();
            }
          }
        });

        service.initialize(audioRef.current);
        playerServiceRef.current = service;
        setIsInitialized(true);

        // Aplica volume inicial
        const normalizedVolume = Math.max(0.01, preferences.volume / 100);
        service.setVolume(normalizedVolume);

        console.log('useAudioPlayer: Inicialização concluída com sucesso');

        // Timeout de segurança - REDUZIDO para 8 segundos
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
        }
        
        loadingTimeoutRef.current = setTimeout(() => {
          if (playerServiceRef.current && !playerState.canPlay && !playerState.hasError) {
            console.warn('useAudioPlayer: Timeout de carregamento atingido - iniciando retry');
            retryInitialization();
          }
        }, 8000);

      } catch (error) {
        console.error('useAudioPlayer: Erro na inicialização:', error);
        setIsInitialized(false);
        if (onError) {
          onError('Erro ao inicializar player de áudio');
        }
      }
    };

    initializePlayer();

    return () => {
      console.log('useAudioPlayer: Executando cleanup');
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (playerServiceRef.current) {
        playerServiceRef.current.cleanup();
        playerServiceRef.current = null;
      }
      setIsInitialized(false);
      setRetryCount(0);
    };
  }, [audioUrl, handleRepeatComplete, retryInitialization]);

  // Atualiza preferências de volume
  useEffect(() => {
    if (playerServiceRef.current && playerState.canPlay && isInitialized) {
      const normalizedVolume = Math.max(0.01, preferences.volume / 100);
      console.log('useAudioPlayer: Atualizando volume:', preferences.volume, 'normalizado:', normalizedVolume);
      playerServiceRef.current.setVolume(normalizedVolume);
      setBackgroundVolume(preferences.volume);
    }
  }, [preferences.volume, playerState.canPlay, isInitialized, setBackgroundVolume]);

  // Notifica o contexto sobre o estado do áudio principal
  useEffect(() => {
    if (!playerState.isTransitioning && !playerState.isInternalPause) {
      console.log('useAudioPlayer: Notificando contexto - áudio principal:', playerState.isPlaying ? 'tocando' : 'parado');
      audioPlaybackContext?.setMainAudioPlaying(playerState.isPlaying);
    }
  }, [playerState.isPlaying, playerState.isTransitioning, playerState.isInternalPause, audioPlaybackContext]);

  // Auto-play functionality
  useEffect(() => {
    if (preferences.autoPlay && 
        playerServiceRef.current && 
        !playerState.isPlaying && 
        playerState.canPlay && 
        !playerState.hasError && 
        !playerState.isTransitioning &&
        !playerState.isInternalPause &&
        isInitialized) {
      console.log('useAudioPlayer: Executando auto-play');
      const autoPlayTimeout = setTimeout(() => {
        if (playerServiceRef.current && playerState.canPlay && !playerState.hasError && isInitialized) {
          console.log('useAudioPlayer: Iniciando auto-play com delay');
          playerServiceRef.current.togglePlay().catch(error => {
            console.error('useAudioPlayer: Erro no auto-play:', error);
          });
        }
      }, 500);
      
      return () => clearTimeout(autoPlayTimeout);
    }
  }, [preferences.autoPlay, playerState.canPlay, playerState.hasError, playerState.isTransitioning, playerState.isInternalPause, playerState.isPlaying, isInitialized]);

  const togglePlay = async () => {
    console.log('useAudioPlayer: Toggle play solicitado', {
      hasService: !!playerServiceRef.current,
      canPlay: playerState.canPlay,
      hasError: playerState.hasError,
      isPlaying: playerState.isPlaying,
      isLoading: playerState.isLoading,
      isInitialized,
      retryCount
    });
    
    if (!playerServiceRef.current || !isInitialized) {
      const errorMsg = 'Player não inicializado. Aguarde alguns segundos e tente novamente.';
      console.error('useAudioPlayer:', errorMsg);
      if (onError) {
        onError(errorMsg);
      }
      return;
    }

    if (!playerState.canPlay || playerState.hasError) {
      // Se há erro, sugerir retry
      if (playerState.hasError && retryCount < 3) {
        console.log('useAudioPlayer: Erro detectado, iniciando retry automático');
        await retryInitialization();
        return;
      }
      
      const errorMsg = 'Áudio não está pronto para reprodução. Tente recarregar a página.';
      console.warn('useAudioPlayer:', errorMsg);
      if (onError) {
        onError(errorMsg);
      }
      return;
    }
    
    try {
      console.log('useAudioPlayer: Executando toggle play');
      await playerServiceRef.current.togglePlay();
      console.log('useAudioPlayer: Toggle play executado com sucesso');
    } catch (error) {
      const errorMsg = 'Erro ao reproduzir áudio. Tente novamente.';
      console.error('useAudioPlayer: Erro no toggle play:', error);
      if (onError) {
        onError(errorMsg);
      }
    }
  };

  const reset = () => {
    console.log('useAudioPlayer: Reset solicitado');
    if (playerServiceRef.current && isInitialized) {
      playerServiceRef.current.reset();
    }
    setRepeatCount(0);
    setRetryCount(0);
  };

  const seek = (time: number) => {
    if (playerServiceRef.current && playerState.canPlay && !playerState.hasError && isInitialized) {
      playerServiceRef.current.seek(time);
    }
  };

  const setMuted = (muted: boolean) => {
    if (playerServiceRef.current && isInitialized) {
      playerServiceRef.current.setMuted(muted);
    }
    setBackgroundMuted(muted);
  };

  // Calcula isReady
  const isReady = isInitialized && 
                 playerState.canPlay && 
                 !playerState.hasError && 
                 !playerState.isLoading && 
                 !!playerServiceRef.current &&
                 !isValidatingUrl;

  console.log('useAudioPlayer: Estado final isReady:', isReady, {
    isInitialized,
    canPlay: playerState.canPlay,
    hasError: playerState.hasError,
    isLoading: playerState.isLoading,
    hasService: !!playerServiceRef.current,
    isValidatingUrl,
    retryCount
  });

  return {
    audioRef,
    playerState: {
      ...playerState,
      isReady
    },
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
