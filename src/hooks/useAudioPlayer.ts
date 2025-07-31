import { useState, useRef, useEffect } from 'react';
import { AudioPlayerService, AudioPlayerState } from '@/services/audioPlayerService';
import { AudioPreferences } from '@/services/audioPreferencesService';

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
    canPlay: false
  });
  const [repeatCount, setRepeatCount] = useState(0);

  // Inicializa o serviço de player
  useEffect(() => {
    if (!audioRef.current) return;

    const service = new AudioPlayerService({
      onStateChange: setPlayerState,
      onRepeatComplete: () => {
        const newRepeatCount = repeatCount + 1;
        setRepeatCount(newRepeatCount);
        onRepeatComplete?.();
        
        // Verifica se deve continuar repetindo
        const shouldContinue = preferences.repeatCount === 0 || newRepeatCount < preferences.repeatCount;
        
        if (shouldContinue && audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        }
      },
      onError
    });

    service.initialize(audioRef.current);
    playerServiceRef.current = service;

    return () => {
      service.cleanup();
    };
  }, [audioUrl]);

  // Atualiza preferências de volume
  useEffect(() => {
    if (playerServiceRef.current) {
      playerServiceRef.current.setVolume(preferences.volume);
    }
  }, [preferences.volume]);

  // Auto-play functionality
  useEffect(() => {
    if (preferences.autoPlay && audioRef.current && !playerState.isPlaying && playerState.canPlay) {
      playerServiceRef.current?.togglePlay();
    }
  }, [audioUrl, preferences.autoPlay, playerState.canPlay]);

  const togglePlay = () => {
    playerServiceRef.current?.togglePlay();
  };

  const reset = () => {
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
    togglePlay,
    reset,
    seek,
    setMuted
  };
};