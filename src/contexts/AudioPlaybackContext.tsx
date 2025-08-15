
/**
 * Audio Playback Context
 * Responsabilidade: Controle centralizado de áudio principal e música de fundo
 * Princípio SSOT: Fonte única da verdade para todos os controles de áudio
 * Princípio SRP: Coordenação global de áudio
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { backgroundMusicPlayer, BackgroundMusicState } from '@/services/backgroundMusicPlayerService';
import { audioPreferencesService } from '@/services/audioPreferencesService';

interface AudioPlaybackContextType {
  // Áudio principal
  isMainAudioPlaying: boolean;
  setMainAudioPlaying: (playing: boolean) => void;
  mainAudioVolume: number;
  setMainAudioVolume: (volume: number) => void;
  
  // Música de fundo
  backgroundMusicState: BackgroundMusicState;
  isBackgroundMusicEnabled: boolean;
  toggleBackgroundMusic: (enabled: boolean) => void;
  setBackgroundVolume: (volume: number) => void;
  setBackgroundMuted: (muted: boolean) => void;
  refreshBackgroundMusic: () => Promise<void>;
  
  // Primeira visita
  shouldShowFirstVisitPrompt: boolean;
  dismissFirstVisitPrompt: () => void;
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
  // Estado do áudio principal
  const [isMainAudioPlaying, setIsMainAudioPlaying] = useState(false);
  const [mainAudioVolume, setMainAudioVolume] = useState(50);

  // Estado da música de fundo
  const [backgroundMusicState, setBackgroundMusicState] = useState<BackgroundMusicState>(
    backgroundMusicPlayer.getState()
  );
  const [isBackgroundMusicEnabled, setIsBackgroundMusicEnabled] = useState(false);
  const [shouldShowFirstVisitPrompt, setShouldShowFirstVisitPrompt] = useState(false);

  // Inicialização da música de fundo (SSOT)
  useEffect(() => {
    console.log('AudioPlaybackProvider: Inicializando controle centralizado de música de fundo');
    
    // Carrega preferências do usuário
    const preferences = audioPreferencesService.getPreferences();
    setIsBackgroundMusicEnabled(preferences.backgroundMusicEnabled);
    
    // Verifica se deve mostrar prompt de primeira visita
    if (preferences.isFirstVisit) {
      console.log('AudioPlaybackProvider: Primeira visita detectada, mostrando prompt');
      setShouldShowFirstVisitPrompt(true);
    }
    
    // Configura listener de estado do player
    const unsubscribe = backgroundMusicPlayer.onStateChange(setBackgroundMusicState);
    
    // Inicializa o player apenas se música estiver habilitada
    if (preferences.backgroundMusicEnabled) {
      backgroundMusicPlayer.initialize().then(() => {
        console.log('AudioPlaybackProvider: Player de música de fundo inicializado');
      }).catch(error => {
        console.error('AudioPlaybackProvider: Erro ao inicializar player:', error);
      });
    }
    
    return unsubscribe;
  }, []);

  // Controle automático da música de fundo baseado na preferência
  useEffect(() => {
    console.log('AudioPlaybackProvider: Verificando estado para reprodução contínua', {
      isEnabled: isBackgroundMusicEnabled,
      isPlaying: backgroundMusicState.isPlaying,
      isLoading: backgroundMusicState.isLoading,
      hasError: backgroundMusicState.hasError
    });
    
    if (isBackgroundMusicEnabled) {
      // Deve tocar música de fundo continuamente
      if (!backgroundMusicState.isPlaying && !backgroundMusicState.isLoading && !backgroundMusicState.hasError) {
        console.log('AudioPlaybackProvider: Iniciando reprodução contínua centralizada');
        backgroundMusicPlayer.play().catch(error => {
          console.error('AudioPlaybackProvider: Erro ao iniciar reprodução:', error);
        });
      }
    } else {
      // Deve pausar música de fundo
      if (backgroundMusicState.isPlaying) {
        console.log('AudioPlaybackProvider: Pausando reprodução (música desabilitada)');
        backgroundMusicPlayer.pause();
      }
    }
  }, [isBackgroundMusicEnabled, backgroundMusicState.isPlaying, backgroundMusicState.isLoading, backgroundMusicState.hasError]);

  // Sincroniza volume da música de fundo com o volume principal
  useEffect(() => {
    console.log('AudioPlaybackProvider: Sincronizando volume da música de fundo:', mainAudioVolume);
    backgroundMusicPlayer.setVolume(mainAudioVolume / 100);
  }, [mainAudioVolume]);

  const setMainAudioPlaying = useCallback((playing: boolean) => {
    console.log('AudioPlaybackProvider: Main audio playing state:', playing);
    setIsMainAudioPlaying(playing);
  }, []);

  const handleSetMainAudioVolume = useCallback((volume: number) => {
    console.log('AudioPlaybackProvider: Main audio volume:', volume);
    setMainAudioVolume(volume);
  }, []);

  const toggleBackgroundMusic = useCallback((enabled: boolean) => {
    console.log('AudioPlaybackProvider: Toggle música de fundo:', enabled);
    setIsBackgroundMusicEnabled(enabled);
    
    // Atualiza preferências do usuário
    const currentPreferences = audioPreferencesService.getPreferences();
    audioPreferencesService.updatePreferences({
      ...currentPreferences,
      backgroundMusicEnabled: enabled
    });

    // Se habilitando e player não inicializado, inicializa
    if (enabled && !backgroundMusicState.currentMusic) {
      console.log('AudioPlaybackProvider: Inicializando player para nova ativação');
      backgroundMusicPlayer.initialize().then(() => {
        backgroundMusicPlayer.play();
      }).catch(error => {
        console.error('AudioPlaybackProvider: Erro ao inicializar:', error);
      });
    }

    // Se desabilitando, para imediatamente
    if (!enabled && backgroundMusicState.isPlaying) {
      console.log('AudioPlaybackProvider: Parando música por desabilitação');
      backgroundMusicPlayer.pause();
    }
  }, [backgroundMusicState.isPlaying, backgroundMusicState.currentMusic]);

  const setBackgroundVolume = useCallback((volume: number) => {
    console.log('AudioPlaybackProvider: Definindo volume da música de fundo:', volume);
    backgroundMusicPlayer.setVolume(volume / 100);
  }, []);

  const setBackgroundMuted = useCallback((muted: boolean) => {
    console.log('AudioPlaybackProvider: Definindo mute da música de fundo:', muted);
    backgroundMusicPlayer.setMuted(muted);
  }, []);

  const refreshBackgroundMusic = useCallback(async () => {
    console.log('AudioPlaybackProvider: Refreshing background music player');
    await backgroundMusicPlayer.refresh();
  }, []);

  const dismissFirstVisitPrompt = useCallback(() => {
    console.log('AudioPlaybackProvider: Dismissing first visit prompt');
    setShouldShowFirstVisitPrompt(false);
  }, []);

  const value: AudioPlaybackContextType = {
    // Áudio principal
    isMainAudioPlaying,
    setMainAudioPlaying,
    mainAudioVolume,
    setMainAudioVolume: handleSetMainAudioVolume,
    
    // Música de fundo
    backgroundMusicState,
    isBackgroundMusicEnabled,
    toggleBackgroundMusic,
    setBackgroundVolume,
    setBackgroundMuted,
    refreshBackgroundMusic,
    
    // Primeira visita
    shouldShowFirstVisitPrompt,
    dismissFirstVisitPrompt
  };

  return (
    <AudioPlaybackContext.Provider value={value}>
      {children}
    </AudioPlaybackContext.Provider>
  );
};
