
/**
 * Hook customizado para gerenciar o estado do player de áudio
 * Segue o princípio de Composição sobre Herança
 * Segue SSOT: busca configuração administrativa centralizada
 * Modificado: Remove controle da música de fundo, apenas sincroniza volume
 */

import { useState, useRef, useEffect } from 'react';
import { AudioPlayerService, AudioPlayerState } from '@/services/audioPlayerService';
import { AudioPreferences } from '@/services/audioPreferencesService';
import { AudioConfigService } from '@/services/supabase/audioConfigService';
import { useAudioPlaybackSafe } from '@/contexts/AudioPlaybackContext';

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
    isLoading: false,
    hasError: false,
    canPlay: false,
    isTransitioning: false,
    isInternalPause: false
  });
  const [repeatCount, setRepeatCount] = useState(0);
  const [pauseBetweenRepeats, setPauseBetweenRepeats] = useState(3);
  
  // Context apenas para sincronização de volume
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

    const service = new AudioPlayerService({
      onStateChange: setPlayerState,
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
    service.setVolume(preferences.volume);

    return () => {
      console.log('useAudioPlayer: Limpando serviço');
      service.cleanup();
    };
  }, [audioUrl, preferences.repeatCount, pauseBetweenRepeats]);

  // Atualiza preferências de volume e sincroniza com contexto
  useEffect(() => {
    if (playerServiceRef.current) {
      const normalizedVolume = Math.max(0.01, preferences.volume / 100);
      console.log('useAudioPlayer: Definindo volume:', preferences.volume, 'normalizado:', normalizedVolume);
      playerServiceRef.current.setVolume(normalizedVolume);
      
      // Sincroniza volume com contexto (para música de fundo)
      audioPlaybackContext?.setMainAudioVolume(preferences.volume);
    }
  }, [preferences.volume, audioPlaybackContext]);

  // Notifica o contexto sobre o estado do áudio principal (apenas para informação)
  useEffect(() => {
    if (!playerState.isTransitioning) {
      console.log('useAudioPlayer: Notificando contexto - áudio principal:', playerState.isPlaying ? 'tocando' : 'parado');
      audioPlaybackContext?.setMainAudioPlaying(playerState.isPlaying);
    }
  }, [playerState.isPlaying, playerState.isTransitioning, audioPlaybackContext]);

  // Auto-play functionality (modificado para considerar pausa interna)
  useEffect(() => {
    if (preferences.autoPlay && 
        audioRef.current && 
        !playerState.isPlaying && 
        playerState.canPlay && 
        !playerState.hasError && 
        !playerState.isTransitioning &&
        !playerState.isInternalPause) {
      console.log('useAudioPlayer: Executando auto-play');
      setTimeout(() => {
        playerServiceRef.current?.togglePlay();
      }, 200);
    }
  }, [preferences.autoPlay, playerState.canPlay, playerState.hasError, playerState.isTransitioning, playerState.isInternalPause]);

  const togglePlay = () => {
    console.log('useAudioPlayer: Toggle play solicitado');
    playerServiceRef.current?.togglePlay();
  };

  const reset = () => {
    console.log('useAudioPlayer: Reset solicitado');
    playerServiceRef.current?.reset();
    setRepeatCount(0);
  };

  const seek = (time: number) => {
    playerServiceRef.current?.seek(time);
  };

  const setMuted = (muted: boolean) => {
    playerServiceRef.current?.setMuted(muted);
  };

  return {
    audioRef,
    playerState,
    repeatCount,
    pauseBetweenRepeats,
    togglePlay,
    reset,
    seek,
    setMuted
  };
};
