
/**
 * Audio Playback Context
 * Responsabilidade: Controlar quando a música de fundo deve tocar
 * Princípio SRP: Apenas gerenciamento de estado de reprodução
 */

import * as React from "react";

interface AudioPlaybackContextType {
  isMainAudioPlaying: boolean;
  setMainAudioPlaying: (playing: boolean) => void;
  shouldPlayBackgroundMusic: boolean;
  // SSOT para intenção do usuário
  userIntentionPlaying: boolean;
  setUserIntentionPlaying: (playing: boolean) => void;
}

const AudioPlaybackContext = React.createContext<AudioPlaybackContextType | null>(null);

export const useAudioPlayback = () => {
  const context = React.useContext(AudioPlaybackContext);
  if (!context) {
    throw new Error('useAudioPlayback must be used within AudioPlaybackProvider');
  }
  return context;
};

// Hook seguro que pode ser usado fora do contexto
export const useAudioPlaybackSafe = () => {
  const context = React.useContext(AudioPlaybackContext);
  return context; // Retorna null se não estiver no contexto
};

export const AudioPlaybackProvider = ({ children }: { children: React.ReactNode }) => {
  const [isMainAudioPlaying, setIsMainAudioPlaying] = React.useState(false);
  const [userIntentionPlaying, setUserIntentionPlaying] = React.useState(false);
  const debounceTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const [debouncedMainAudioPlaying, setDebouncedMainAudioPlaying] = React.useState(false);

  const setMainAudioPlaying = React.useCallback((playing: boolean) => {
    console.log('AudioPlaybackContext: Main audio playing state:', playing);
    setIsMainAudioPlaying(playing);

    // Limpa timeout anterior se existir
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (playing) {
      // Se está tocando, atualiza imediatamente
      console.log('AudioPlaybackContext: Áudio principal iniciou - música de fundo deve pausar imediatamente');
      setDebouncedMainAudioPlaying(true);
    } else {
      // Se parou, aguarda um delay antes de retomar música de fundo
      // Isso evita interrupções durante loops rápidos
      console.log('AudioPlaybackContext: Áudio principal parou - aguardando 200ms antes de retomar música de fundo');
      debounceTimeoutRef.current = setTimeout(() => {
        console.log('AudioPlaybackContext: Timeout concluído - retomando música de fundo');
        setDebouncedMainAudioPlaying(false);
        debounceTimeoutRef.current = null;
      }, 200);
    }
  }, []);

  // Música de fundo deve tocar quando NÃO há áudio principal tocando
  const shouldPlayBackgroundMusic = !debouncedMainAudioPlaying;

  const value: AudioPlaybackContextType = {
    isMainAudioPlaying,
    setMainAudioPlaying,
    shouldPlayBackgroundMusic,
    userIntentionPlaying,
    setUserIntentionPlaying
  };

  return (
    <AudioPlaybackContext.Provider value={value}>
      {children}
    </AudioPlaybackContext.Provider>
  );
};
