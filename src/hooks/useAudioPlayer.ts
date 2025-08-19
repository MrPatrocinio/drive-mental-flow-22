
import { useState, useRef, useEffect, useCallback } from 'react';
import { AudioPlayerService, AudioPlayerState } from '@/services/audioPlayerService';
import { AudioPreferences } from '@/services/audioPreferencesService';
import { AudioConfigService } from '@/services/supabase/audioConfigService';
import { useBackgroundMusic } from './useBackgroundMusic';
import { useAudioPlaybackSafe } from '@/contexts/AudioPlaybackContext';

/**
 * Hook customizado para gerenciar o estado do player de áudio
 * Segue o princípio de Composição sobre Herança
 * Segue SSOT: busca configuração administrativa centralizada
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
  
  // Refs para controle de debounce e instância única
  const onRepeatCompleteRef = useRef(onRepeatComplete);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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

  // Inicializa o serviço de player - CORREÇÃO APLICADA
  useEffect(() => {
    if (!audioUrl) {
      console.log('useAudioPlayer: URL não fornecida');
      return;
    }

    console.log('useAudioPlayer: Iniciando inicialização para URL:', audioUrl);
    
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
          }
        });

        service.initialize(audioRef.current);
        playerServiceRef.current = service;
        setIsInitialized(true);

        // Aplica volume inicial
        const normalizedVolume = Math.max(0.01, preferences.volume / 100);
        service.setVolume(normalizedVolume);

        console.log('useAudioPlayer: Inicialização concluída com sucesso');

        // Timeout de segurança para detectar problemas de carregamento
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
        }
        
        loadingTimeoutRef.current = setTimeout(() => {
          if (playerServiceRef.current && !playerState.canPlay && !playerState.hasError) {
            console.warn('useAudioPlayer: Timeout de carregamento atingido');
            if (onError) {
              onError('Timeout ao carregar áudio. Verifique sua conexão e tente novamente.');
            }
          }
        }, 15000); // Aumentado para 15 segundos

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
      if (playerServiceRef.current) {
        playerServiceRef.current.cleanup();
        playerServiceRef.current = null;
      }
      setIsInitialized(false);
    };
  }, [audioUrl, handleRepeatComplete]);

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
      isInitialized
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
      const errorMsg = 'Áudio não está pronto para reprodução. Verifique sua conexão e tente novamente.';
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

  // CORREÇÃO PRINCIPAL: Calcula isReady sem depender de duration > 0
  const isReady = isInitialized && 
                 playerState.canPlay && 
                 !playerState.hasError && 
                 !playerState.isLoading && 
                 !!playerServiceRef.current;
                 // Removido: && playerState.duration > 0

  console.log('useAudioPlayer: Estado final isReady:', isReady, {
    isInitialized,
    canPlay: playerState.canPlay,
    hasError: playerState.hasError,
    isLoading: playerState.isLoading,
    hasService: !!playerServiceRef.current,
    duration: playerState.duration,
    RACE_CONDITION_FIX: 'Removida dependência de duration > 0'
  });

  return {
    audioRef,
    playerState: {
      ...playerState,
      isReady
    },
    repeatCount,
    pauseBetweenRepeats,
    togglePlay,
    reset,
    seek,
    setMuted
  };
};
