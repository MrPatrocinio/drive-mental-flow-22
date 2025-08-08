
import { useState, useRef, useEffect } from 'react';
import { AudioPlayerService, AudioPlayerState } from '@/services/audioPlayerService';
import { AudioPreferences } from '@/services/audioPreferencesService';
import { useBackgroundMusic } from './useBackgroundMusic';
import { useAudioPlaybackSafe } from '@/contexts/AudioPlaybackContext';

/**
 * Hook customizado para gerenciar o estado do player de áudio
 * Segue o princípio de Composição sobre Herança
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
    isLoading: false,
    hasError: false,
    canPlay: false,
    isTransitioning: false
  });
  const [repeatCount, setRepeatCount] = useState(0);
  
  // Hook para música de fundo
  const { setVolume: setBackgroundVolume, setMuted: setBackgroundMuted } = useBackgroundMusic();
  
  // Context para controlar música de fundo
  const audioPlaybackContext = useAudioPlaybackSafe();

  // Inicializa o serviço de player
  useEffect(() => {
    if (!audioRef.current) return;

    console.log('useAudioPlayer: Inicializando player para:', audioUrl);
    setRepeatCount(0); // Reset count on new audio

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
            console.log('useAudioPlayer: Executando próxima repetição (otimizada)');
            // Usa o método otimizado de loop
            playerServiceRef.current.performLoop();
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
  }, [audioUrl, preferences.repeatCount]);

  // Atualiza preferências de volume
  useEffect(() => {
    if (playerServiceRef.current) {
      // Volume já normalizado entre 0 e 1, mínimo 1%
      const normalizedVolume = Math.max(0.01, preferences.volume / 100);
      console.log('useAudioPlayer: Definindo volume:', preferences.volume, 'normalizado:', normalizedVolume);
      playerServiceRef.current.setVolume(normalizedVolume);
      
      // Sincroniza volume com música de fundo
      setBackgroundVolume(preferences.volume);
    }
  }, [preferences.volume, setBackgroundVolume]);

  // Notifica o contexto sobre o estado do áudio principal (apenas quando não está em transição)
  useEffect(() => {
    if (!playerState.isTransitioning) {
      console.log('useAudioPlayer: Notificando contexto - áudio principal:', playerState.isPlaying ? 'tocando' : 'parado');
      audioPlaybackContext?.setMainAudioPlaying(playerState.isPlaying);
    } else {
      console.log('useAudioPlayer: Em transição - não notificando contexto');
    }
  }, [playerState.isPlaying, playerState.isTransitioning, audioPlaybackContext]);

  // Auto-play functionality
  useEffect(() => {
    if (preferences.autoPlay && audioRef.current && !playerState.isPlaying && playerState.canPlay && !playerState.hasError && !playerState.isTransitioning) {
      console.log('useAudioPlayer: Executando auto-play');
      setTimeout(() => {
        playerServiceRef.current?.togglePlay();
      }, 200);
    }
  }, [preferences.autoPlay, playerState.canPlay, playerState.hasError, playerState.isTransitioning]);

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
    // Sincroniza mute com música de fundo
    setBackgroundMuted(muted);
  };

  return {
    audioRef,
    playerState,
    repeatCount,
    togglePlay,
    reset,
    seek,
    setMuted
  };
};
