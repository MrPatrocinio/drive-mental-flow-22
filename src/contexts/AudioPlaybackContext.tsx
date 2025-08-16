
/**
 * Audio Playback Context
 * Responsabilidade: Monitorar estado do áudio principal (apenas para observação)
 * Princípio SRP: Apenas rastreamento de estado, sem controle de música de fundo
 */

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

interface AudioPlaybackContextType {
  isMainAudioPlaying: boolean;
  setMainAudioPlaying: (playing: boolean) => void;
  // Removido shouldPlayBackgroundMusic - não deve influenciar música de fundo
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
    console.log('AudioPlaybackContext: Main audio playing state (apenas monitoramento):', playing);
    setIsMainAudioPlaying(playing);
  }, []);

  const value: AudioPlaybackContextType = {
    isMainAudioPlaying,
    setMainAudioPlaying
  };

  return (
    <AudioPlaybackContext.Provider value={value}>
      {children}
    </AudioPlaybackContext.Provider>
  );
};
