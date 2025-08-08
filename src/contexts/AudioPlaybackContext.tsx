
/**
 * Audio Playback Context
 * Responsabilidade: Controlar quando a música de fundo deve tocar
 * Princípio SRP: Apenas gerenciamento de estado de reprodução
 */

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

interface AudioPlaybackContextType {
  isMainAudioPlaying: boolean;
  setMainAudioPlaying: (playing: boolean) => void;
  shouldPlayBackgroundMusic: boolean;
}

const AudioPlaybackContext = createContext<AudioPlaybackContextType | null>(null);

export const useAudioPlayback = () => {
  const context = useContext(AudioPlaybackContext);
  if (!context) {
    throw new Error('useAudioPlayback must be used within AudioPlaybackProvider');
  }
  return context;
};

// Hook seguro que pode ser usado fora do contexto
export const useAudioPlaybackSafe = () => {
  const context = useContext(AudioPlaybackContext);
  return context; // Retorna null se não estiver no contexto
};

export const AudioPlaybackProvider = ({ children }: { children: React.ReactNode }) => {
  const [isMainAudioPlaying, setIsMainAudioPlaying] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [debouncedMainAudioPlaying, setDebouncedMainAudioPlaying] = useState(false);

  const setMainAudioPlaying = useCallback((playing: boolean) => {
    console.log('AudioPlaybackContext: Main audio playing state:', playing);
    setIsMainAudioPlaying(playing);

    // Limpa timeout anterior se existir
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (playing) {
      // Se está tocando, atualiza imediatamente
      console.log('AudioPlaybackContext: Áudio principal iniciou - música de fundo deve tocar imediatamente');
      setDebouncedMainAudioPlaying(true);
    } else {
      // Se parou, aguarda um delay antes de pausar música de fundo
      // Isso evita interrupções durante loops rápidos
      console.log('AudioPlaybackContext: Áudio principal parou - aguardando 200ms antes de pausar música de fundo');
      debounceTimeoutRef.current = setTimeout(() => {
        console.log('AudioPlaybackContext: Timeout concluído - pausando música de fundo');
        setDebouncedMainAudioPlaying(false);
        debounceTimeoutRef.current = null;
      }, 200);
    }
  }, []);

  // Música de fundo deve tocar baseado no estado com debounce
  const shouldPlayBackgroundMusic = debouncedMainAudioPlaying;

  const value: AudioPlaybackContextType = {
    isMainAudioPlaying,
    setMainAudioPlaying,
    shouldPlayBackgroundMusic
  };

  return (
    <AudioPlaybackContext.Provider value={value}>
      {children}
    </AudioPlaybackContext.Provider>
  );
};
