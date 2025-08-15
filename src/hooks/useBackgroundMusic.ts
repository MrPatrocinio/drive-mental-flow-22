
/**
 * useBackgroundMusic Hook
 * Responsabilidade: Interface React para o player de música de fundo
 * Princípio SRP: Apenas lógica de hook para background music
 * Princípio KISS: Lógica simplificada - música independente
 */

import { useState, useEffect, useCallback } from 'react';
import { backgroundMusicPlayer, BackgroundMusicState } from '@/services/backgroundMusicPlayerService';
import { audioPreferencesService } from '@/services/audioPreferencesService';
import { useAudioPlaybackSafe } from '@/contexts/AudioPlaybackContext';

export const useBackgroundMusic = () => {
  const [state, setState] = useState<BackgroundMusicState>(backgroundMusicPlayer.getState());
  const [isEnabled, setIsEnabled] = useState(false);
  
  // Obtém contexto apenas para sincronização de volume
  const audioPlaybackContext = useAudioPlaybackSafe();

  // Carrega preferências do usuário
  useEffect(() => {
    const preferences = audioPreferencesService.getPreferences();
    console.log('useBackgroundMusic: Preferências carregadas:', preferences);
    setIsEnabled(preferences.backgroundMusicEnabled);
  }, []);

  // Monitora mudanças no estado do player
  useEffect(() => {
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

  // Controla reprodução baseado apenas na preferência do usuário (KISS)
  useEffect(() => {
    console.log('useBackgroundMusic: Verificando estado para reprodução', {
      isEnabled,
      isPlaying: state.isPlaying,
      isLoading: state.isLoading,
      hasError: state.hasError,
      currentMusic: state.currentMusic?.title
    });
    
    if (isEnabled) {
      // Deve tocar música de fundo continuamente
      if (!state.isPlaying && !state.isLoading && !state.hasError) {
        console.log('useBackgroundMusic: Iniciando reprodução contínua');
        backgroundMusicPlayer.play().catch(error => {
          console.error('useBackgroundMusic: Erro ao iniciar reprodução:', error);
        });
      }
    } else {
      // Deve pausar música de fundo
      if (state.isPlaying) {
        console.log('useBackgroundMusic: Pausando reprodução (música desabilitada)');
        backgroundMusicPlayer.pause();
      }
    }
  }, [isEnabled, state.isPlaying, state.isLoading, state.hasError]);

  // Sincroniza volume com o áudio principal
  useEffect(() => {
    if (audioPlaybackContext?.mainAudioVolume) {
      console.log('useBackgroundMusic: Sincronizando volume com áudio principal:', audioPlaybackContext.mainAudioVolume);
      setVolume(audioPlaybackContext.mainAudioVolume);
    }
  }, [audioPlaybackContext?.mainAudioVolume]);

  const toggleEnabled = useCallback((enabled: boolean) => {
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

  const setVolume = useCallback((volume: number) => {
    console.log('useBackgroundMusic: Definindo volume:', volume);
    backgroundMusicPlayer.setVolume(volume / 100);
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    console.log('useBackgroundMusic: Definindo mute:', muted);
    backgroundMusicPlayer.setMuted(muted);
  }, []);

  const refresh = useCallback(async () => {
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
