
import { useState, useRef, useEffect } from 'react';
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
    isLoading: true, // Inicia como loading
    hasError: false,
    canPlay: false,
    isTransitioning: false,
    isInternalPause: false
  });
  const [repeatCount, setRepeatCount] = useState(0);
  const [pauseBetweenRepeats, setPauseBetweenRepeats] = useState(3);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Hook para música de fundo
  const { setVolume: setBackgroundVolume, setMuted: setBackgroundMuted } = useBackgroundMusic();
  
  // Context para controlar música de fundo
  const audioPlaybackContext = useAudioPlaybackSafe();

  // Carrega configuração administrativa de pausa (SSOT)
  useEffect(() => {
    const loadAudioConfig = async () => {
      try {
        const config = await AudioConfigService.getAudioConfig();
        setPauseBetweenRepeats(config.pause_between_repeats_seconds);
        console.log('useAudioPlayer: Configuração de pausa carregada:', config.pause_between_repeats_seconds, 'segundos');
      } catch (error) {
        console.error('useAudioPlayer: Erro ao carregar configuração de pausa:', error);
      }
    };

    loadAudioConfig();
  }, []);

  // Inicializa o serviço de player
  useEffect(() => {
    if (!audioRef.current) return;

    console.log('useAudioPlayer: Inicializando player para:', audioUrl);
    setRepeatCount(0);
    setIsInitialized(false);

    const service = new AudioPlayerService({
      onStateChange: (newState) => {
        setPlayerState(newState);
        // Marca como inicializado quando o áudio estiver pronto
        if (newState.canPlay && !isInitialized) {
          setIsInitialized(true);
          console.log('useAudioPlayer: Player totalmente inicializado');
        }
      },
      onRepeatComplete: () => {
        console.log('useAudioPlayer: Repetição concluída');
        setRepeatCount(current => {
          const newCount = current + 1;
          onRepeatComplete?.();
          
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
      },
      onError
    });

    service.initialize(audioRef.current);
    playerServiceRef.current = service;

    // Aplica configurações iniciais
    service.setVolume(preferences.volume / 100);

    return () => {
      console.log('useAudioPlayer: Limpando serviço');
      service.cleanup();
      setIsInitialized(false);
    };
  }, [audioUrl, preferences.repeatCount, pauseBetweenRepeats]);

  // Atualiza preferências de volume
  useEffect(() => {
    if (playerServiceRef.current) {
      const normalizedVolume = Math.max(0.01, preferences.volume / 100);
      console.log('useAudioPlayer: Definindo volume:', preferences.volume, 'normalizado:', normalizedVolume);
      playerServiceRef.current.setVolume(normalizedVolume);
      
      // Sincroniza volume com música de fundo
      setBackgroundVolume(preferences.volume);
    }
  }, [preferences.volume, setBackgroundVolume]);

  // Notifica o contexto sobre o estado do áudio principal
  // Princípio KISS: lógica corrigida para ignorar pausas internas e transições
  useEffect(() => {
    // Durante pausas internas, não notifica mudança de estado (mantém música de fundo)
    if (!playerState.isTransitioning && !playerState.isInternalPause) {
      console.log('useAudioPlayer: Notificando contexto - áudio principal:', playerState.isPlaying ? 'tocando' : 'parado');
      audioPlaybackContext?.setMainAudioPlaying(playerState.isPlaying);
    } else {
      console.log('useAudioPlayer: Ignorando notificação do contexto - em transição ou pausa interna:', {
        isTransitioning: playerState.isTransitioning,
        isInternalPause: playerState.isInternalPause,
        isPlaying: playerState.isPlaying
      });
    }
  }, [playerState.isPlaying, playerState.isTransitioning, playerState.isInternalPause, audioPlaybackContext]);

  // Auto-play functionality (corrigido para aguardar inicialização completa)
  useEffect(() => {
    if (preferences.autoPlay && 
        audioRef.current && 
        !playerState.isPlaying && 
        playerState.canPlay && 
        !playerState.hasError && 
        !playerState.isTransitioning &&
        !playerState.isInternalPause &&
        isInitialized) {
      console.log('useAudioPlayer: Executando auto-play');
      setTimeout(() => {
        if (playerServiceRef.current) {
          playerServiceRef.current.togglePlay();
        }
      }, 500); // Aumentado delay para garantir inicialização
    }
  }, [preferences.autoPlay, playerState.canPlay, playerState.hasError, playerState.isTransitioning, playerState.isInternalPause, isInitialized]);

  const togglePlay = () => {
    console.log('useAudioPlayer: Toggle play solicitado', {
      canPlay: playerState.canPlay,
      hasError: playerState.hasError,
      isInitialized
    });
    
    // Verifica se o player está realmente pronto
    if (playerServiceRef.current && playerState.canPlay && !playerState.hasError && isInitialized) {
      playerServiceRef.current.togglePlay();
    } else {
      console.warn('useAudioPlayer: Player não está pronto para reprodução');
      if (onError) {
        onError('Aguarde o áudio carregar completamente antes de reproduzir');
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
    if (playerServiceRef.current && playerState.canPlay) {
      playerServiceRef.current.seek(time);
    }
  };

  const setMuted = (muted: boolean) => {
    if (playerServiceRef.current) {
      playerServiceRef.current.setMuted(muted);
    }
    setBackgroundMuted(muted);
  };

  return {
    audioRef,
    playerState: {
      ...playerState,
      // Adiciona estado de inicialização para componentes
      isReady: isInitialized && playerState.canPlay && !playerState.hasError
    },
    repeatCount,
    pauseBetweenRepeats,
    togglePlay,
    reset,
    seek,
    setMuted
  };
};
