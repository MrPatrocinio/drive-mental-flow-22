
/**
 * useBackgroundMusic Hook
 * Responsabilidade: Interface React para o player de música de fundo
 * Princípio SRP: Apenas lógica de hook para background music
 */

import React from 'react';
import { backgroundMusicPlayer, BackgroundMusicState } from '@/services/backgroundMusicPlayerService';
import { audioPreferencesService } from '@/services/audioPreferencesService';
import { useAudioPlaybackSafe } from '@/contexts/AudioPlaybackContext';

export const useBackgroundMusic = () => {
  const [state, setState] = React.useState<BackgroundMusicState>(backgroundMusicPlayer.getState());
  const [isEnabled, setIsEnabled] = React.useState(false);
  
  // Obtém contexto com fallback seguro
  const audioPlaybackContext = useAudioPlaybackSafe();
  const shouldPlayBackgroundMusic = audioPlaybackContext?.shouldPlayBackgroundMusic || false;

  // Carrega preferências do usuário
  React.useEffect(() => {
    const preferences = audioPreferencesService.getPreferences();
    console.log('useBackgroundMusic: Preferências carregadas:', preferences);
    setIsEnabled(preferences.backgroundMusicEnabled);
  }, []);

  // Monitora mudanças no estado do player
  React.useEffect(() => {
    console.log('useBackgroundMusic: Configurando listener de estado');
    const unsubscribe = backgroundMusicPlayer.onStateChange(setState);
    
    // Inicializa o player se ainda não foi inicializado
    backgroundMusicPlayer.initialize().then(() => {
      console.log('useBackgroundMusic: Player inicializado com sucesso');
    }).catch(error => {
      console.error('useBackgroundMusic: Erro ao inicializar player:', error);
    });
    
    return unsubscribe;
  }, []);

  // Controla reprodução baseado no contexto de áudio principal (com lógica otimizada)
  React.useEffect(() => {
    console.log('useBackgroundMusic: Verificando estado para reprodução', {
      isEnabled,
      shouldPlayBackgroundMusic,
      isPlaying: state.isPlaying,
      isLoading: state.isLoading,
      hasError: state.hasError,
      currentMusic: state.currentMusic?.title
    });
    
    if (isEnabled && shouldPlayBackgroundMusic) {
      // Deve tocar música de fundo
      if (!state.isPlaying && !state.isLoading && !state.hasError) {
        console.log('useBackgroundMusic: Iniciando reprodução (áudio principal ativo)');
        backgroundMusicPlayer.play().catch(error => {
          console.error('useBackgroundMusic: Erro ao iniciar reprodução:', error);
        });
      }
    } else {
      // Deve pausar música de fundo
      if (state.isPlaying) {
        console.log('useBackgroundMusic: Pausando reprodução (áudio principal inativo ou música desabilitada)');
        backgroundMusicPlayer.pause();
      }
    }
  }, [isEnabled, shouldPlayBackgroundMusic, state.isPlaying, state.isLoading, state.hasError]);

  const toggleEnabled = React.useCallback((enabled: boolean) => {
    console.log('useBackgroundMusic: Toggle ativado:', enabled);
    setIsEnabled(enabled);
    
    // Atualiza preferências do usuário
    const currentPreferences = audioPreferencesService.getPreferences();
    audioPreferencesService.updatePreferences({
      ...currentPreferences,
      backgroundMusicEnabled: enabled
    });

    // Se desabilitando, para imediatamente
    if (!enabled && state.isPlaying) {
      console.log('useBackgroundMusic: Parando música por desabilitação');
      backgroundMusicPlayer.pause();
    }
  }, [state.isPlaying]);

  const setVolume = React.useCallback((volume: number) => {
    console.log('useBackgroundMusic: Definindo volume:', volume);
    backgroundMusicPlayer.setVolume(volume / 100);
  }, []);

  const setMuted = React.useCallback((muted: boolean) => {
    console.log('useBackgroundMusic: Definindo mute:', muted);
    backgroundMusicPlayer.setMuted(muted);
  }, []);

  const refresh = React.useCallback(async () => {
    console.log('useBackgroundMusic: Refreshing player');
    await backgroundMusicPlayer.refresh();
  }, []);

  return {
    state,
    isEnabled,
    toggleEnabled,
    setVolume,
    setMuted,
    refresh
  };
};
