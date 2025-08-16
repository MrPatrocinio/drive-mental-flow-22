
/**
 * useBackgroundMusic Hook
 * Responsabilidade: Interface React para o player de música de fundo
 * Princípio SRP: Apenas lógica de hook para background music
 * CORREÇÃO: Lógica simplificada baseada apenas no estado isEnabled (SSOT)
 */

import { useState, useEffect, useCallback } from 'react';
import { backgroundMusicPlayer, BackgroundMusicState } from '@/services/backgroundMusicPlayerService';
import { audioPreferencesService } from '@/services/audioPreferencesService';

export const useBackgroundMusic = () => {
  const [state, setState] = useState<BackgroundMusicState>(backgroundMusicPlayer.getState());
  const [isEnabled, setIsEnabled] = useState(false);

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

  // CORREÇÃO IMPLEMENTADA: Controla reprodução baseado APENAS no estado isEnabled
  // Princípio SSOT: isEnabled é a única fonte da verdade para música de fundo
  // Princípio KISS: Lógica simplificada - música toca quando habilitada
  useEffect(() => {
    console.log('useBackgroundMusic: Verificando estado para reprodução', {
      isEnabled,
      isPlaying: state.isPlaying,
      isLoading: state.isLoading,
      hasError: state.hasError,
      currentMusic: state.currentMusic?.title
    });
    
    if (isEnabled) {
      // Música de fundo está habilitada - deve tocar
      if (!state.isPlaying && !state.isLoading && !state.hasError) {
        console.log('useBackgroundMusic: Iniciando reprodução (música habilitada)');
        backgroundMusicPlayer.play().catch(error => {
          console.error('useBackgroundMusic: Erro ao iniciar reprodução:', error);
        });
      }
    } else {
      // Música de fundo está desabilitada - deve pausar
      if (state.isPlaying) {
        console.log('useBackgroundMusic: Pausando reprodução (música desabilitada pelo usuário)');
        backgroundMusicPlayer.pause();
      }
    }
  }, [isEnabled, state.isPlaying, state.isLoading, state.hasError]);

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
