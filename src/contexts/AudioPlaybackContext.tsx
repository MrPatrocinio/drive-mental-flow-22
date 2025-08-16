
/**
 * Audio Playback Context
 * Responsabilidade: Controlar quando a música de fundo deve tocar
 * Princípio SRP: Apenas gerenciamento de estado de reprodução
 * CORREÇÃO: Removida lógica que pausava música de fundo automaticamente
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

  // CORREÇÃO IMPLEMENTADA: Música de fundo deve tocar sempre (quando habilitada)
  // Princípio KISS: Lógica simplificada - não controla mais música de fundo
  // Princípio SRP: Contexto apenas monitora estado, não controla música de fundo
  const shouldPlayBackgroundMusic = true; // Sempre true - controle feito no useBackgroundMusic

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
