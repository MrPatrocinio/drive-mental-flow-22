
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
  
  // Refs para controle de debounce e instância única
  const onRepeatCompleteRef = useRef(onRepeatComplete);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initializationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Hook para música de fundo
  const { setVolume: setBackgroundVolume, setMuted: setBackgroundMuted } = useBackgroundMusic();
  
  // Context para controlar música de fundo
  const audioPlaybackContext = useAudioPlaybackSafe();

  // Atualiza referência do callback sem recriar o serviço
  useEffect(() => {
    onRepeatCompleteRef.current = onRepeatComplete;
  }, [onRepeatComplete]);

  // Carrega configuração administrativa de pausa (SSOT) - OTIMIZADO
  useEffect(() => {
    const loadAudioConfig = async () => {
      try {
        const config = await AudioConfigService.getAudioConfig();
        setPauseBetweenRepeats(config.pause_between_repeats_seconds);
        console.log('useAudioPlayer: Configuração de pausa carregada:', config.pause_between_repeats_seconds, 'segundos');
      } catch (error) {
        console.error('useAudioPlayer: Erro ao carregar configuração de pausa:', error);
        setPauseBetweenRepeats(3); // Fallback padrão
      }
    };

    loadAudioConfig();
  }, []);

  // Callback debounced para repetição - APRIMORADO
  const handleRepeatComplete = useCallback(() => {
    // Cancela timeout anterior se existir
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Implementa debounce de 300ms para evitar chamadas duplicadas
    debounceTimeoutRef.current = setTimeout(() => {
      console.log('useAudioPlayer: Executando onRepeatComplete (debounced)');
      
      setRepeatCount(current => {
        const newCount = current + 1;
        console.log('useAudioPlayer: Incrementando contador:', newCount);
        
        // Chama callback externo se existir
        if (onRepeatCompleteRef.current) {
          onRepeatCompleteRef.current();
        }
        
        // Verifica se deve continuar repetindo
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

  // Inicializa o serviço de player - ESTABILIZADO
  useEffect(() => {
    if (!audioRef.current || !audioUrl) {
      console.log('useAudioPlayer: Aguardando elemento de áudio ou URL');
      return;
    }

    console.log('useAudioPlayer: Iniciando inicialização estabilizada do player para:', audioUrl);

    // Limpa timeout de inicialização anterior
    if (initializationTimeoutRef.current) {
      clearTimeout(initializationTimeoutRef.current);
    }

    // Limpa serviço anterior se existir
    if (playerServiceRef.current) {
      console.log('useAudioPlayer: Limpando serviço anterior');
      playerServiceRef.current.cleanup();
      playerServiceRef.current = null;
    }

    // Reset do contador
    setRepeatCount(0);

    // Delay pequeno para garantir que o DOM está estável
    initializationTimeoutRef.current = setTimeout(() => {
      if (!audioRef.current) {
        console.warn('useAudioPlayer: Elemento de áudio não disponível após timeout');
        return;
      }

      try {
        console.log('useAudioPlayer: Criando novo serviço de áudio');
        
        const service = new AudioPlayerService({
          onStateChange: (newState) => {
            console.log('useAudioPlayer: Estado atualizado:', newState);
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

        // Aplica volume inicial
        const normalizedVolume = Math.max(0.01, preferences.volume / 100);
        service.setVolume(normalizedVolume);

        console.log('useAudioPlayer: Inicialização estabilizada concluída');
      } catch (error) {
        console.error('useAudioPlayer: Erro na inicialização:', error);
        if (onError) {
          onError('Erro ao inicializar player de áudio');
        }
      }
    }, 100);

    return () => {
      console.log('useAudioPlayer: Executando cleanup');
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (playerServiceRef.current) {
        playerServiceRef.current.cleanup();
        playerServiceRef.current = null;
      }
    };
  }, [audioUrl, handleRepeatComplete]);

  // Atualiza preferências de volume
  useEffect(() => {
    if (playerServiceRef.current && playerState.canPlay) {
      const normalizedVolume = Math.max(0.01, preferences.volume / 100);
      console.log('useAudioPlayer: Atualizando volume:', preferences.volume, 'normalizado:', normalizedVolume);
      playerServiceRef.current.setVolume(normalizedVolume);
      setBackgroundVolume(preferences.volume);
    }
  }, [preferences.volume, playerState.canPlay, setBackgroundVolume]);

  // Notifica o contexto sobre o estado do áudio principal
  useEffect(() => {
    if (!playerState.isTransitioning && !playerState.isInternalPause) {
      console.log('useAudioPlayer: Notificando contexto - áudio principal:', playerState.isPlaying ? 'tocando' : 'parado');
      audioPlaybackContext?.setMainAudioPlaying(playerState.isPlaying);
    }
  }, [playerState.isPlaying, playerState.isTransitioning, playerState.isInternalPause, audioPlaybackContext]);

  // Auto-play functionality - MELHORADO
  useEffect(() => {
    if (preferences.autoPlay && 
        playerServiceRef.current && 
        !playerState.isPlaying && 
        playerState.canPlay && 
        !playerState.hasError && 
        !playerState.isTransitioning &&
        !playerState.isInternalPause) {
      console.log('useAudioPlayer: Executando auto-play');
      const autoPlayTimeout = setTimeout(() => {
        if (playerServiceRef.current && playerState.canPlay && !playerState.hasError) {
          console.log('useAudioPlayer: Iniciando auto-play com delay');
          playerServiceRef.current.togglePlay().catch(error => {
            console.error('useAudioPlayer: Erro no auto-play:', error);
          });
        }
      }, 500);
      
      return () => clearTimeout(autoPlayTimeout);
    }
  }, [preferences.autoPlay, playerState.canPlay, playerState.hasError, playerState.isTransitioning, playerState.isInternalPause, playerState.isPlaying]);

  const togglePlay = async () => {
    console.log('useAudioPlayer: Toggle play solicitado', {
      hasService: !!playerServiceRef.current,
      canPlay: playerState.canPlay,
      hasError: playerState.hasError,
      isPlaying: playerState.isPlaying,
      isLoading: playerState.isLoading
    });
    
    if (!playerServiceRef.current) {
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
    if (playerServiceRef.current) {
      playerServiceRef.current.reset();
    }
    setRepeatCount(0);
  };

  const seek = (time: number) => {
    if (playerServiceRef.current && playerState.canPlay && !playerState.hasError) {
      playerServiceRef.current.seek(time);
    }
  };

  const setMuted = (muted: boolean) => {
    if (playerServiceRef.current) {
      playerServiceRef.current.setMuted(muted);
    }
    setBackgroundMuted(muted);
  };

  // Calcula isReady de forma robusta
  const isReady = playerState.canPlay && 
                 !playerState.hasError && 
                 !playerState.isLoading && 
                 !!playerServiceRef.current &&
                 playerState.duration > 0;

  console.log('useAudioPlayer: Estado isReady:', isReady, {
    canPlay: playerState.canPlay,
    hasError: playerState.hasError,
    isLoading: playerState.isLoading,
    hasService: !!playerServiceRef.current,
    duration: playerState.duration
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
