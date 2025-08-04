/**
 * Audio Playback Context
 * Responsabilidade: Controlar quando a música de fundo deve tocar
 * Princípio SRP: Apenas gerenciamento de estado de reprodução
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

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

  const setMainAudioPlaying = useCallback((playing: boolean) => {
    console.log('AudioPlaybackContext: Main audio playing state:', playing);
    setIsMainAudioPlaying(playing);
  }, []);

  // Música de fundo deve tocar apenas quando há áudio principal tocando
  const shouldPlayBackgroundMusic = isMainAudioPlaying;

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