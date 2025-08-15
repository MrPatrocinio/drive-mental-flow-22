
/**
 * Audio Playback Context
 * Responsabilidade: Apenas sincronização de volume entre áudios
 * Princípio SRP: Removida lógica de controle de música de fundo
 * Princípio KISS: Lógica simplificada - apenas volume
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

interface AudioPlaybackContextType {
  isMainAudioPlaying: boolean;
  setMainAudioPlaying: (playing: boolean) => void;
  mainAudioVolume: number;
  setMainAudioVolume: (volume: number) => void;
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
  const [mainAudioVolume, setMainAudioVolume] = useState(50);

  const setMainAudioPlaying = useCallback((playing: boolean) => {
    console.log('AudioPlaybackContext: Main audio playing state:', playing);
    setIsMainAudioPlaying(playing);
  }, []);

  const handleSetMainAudioVolume = useCallback((volume: number) => {
    console.log('AudioPlaybackContext: Main audio volume:', volume);
    setMainAudioVolume(volume);
  }, []);

  const value: AudioPlaybackContextType = {
    isMainAudioPlaying,
    setMainAudioPlaying,
    mainAudioVolume,
    setMainAudioVolume: handleSetMainAudioVolume
  };

  return (
    <AudioPlaybackContext.Provider value={value}>
      {children}
    </AudioPlaybackContext.Provider>
  );
};
