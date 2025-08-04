/**
 * useBackgroundMusic Hook
 * Responsabilidade: Interface React para o player de música de fundo
 * Princípio SRP: Apenas lógica de hook para background music
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
    setIsEnabled(preferences.backgroundMusicEnabled);
  }, []);

  // Monitora mudanças no estado do player
  useEffect(() => {
    const unsubscribe = backgroundMusicPlayer.onStateChange(setState);
    return unsubscribe;
  }, []);

  // Controla reprodução baseado na preferência do usuário
  useEffect(() => {
    if (isEnabled && !state.isPlaying && !state.isLoading && !state.hasError) {
      backgroundMusicPlayer.play();
    } else if (!isEnabled && state.isPlaying) {
      backgroundMusicPlayer.pause();
    }
  }, [isEnabled, state.isPlaying, state.isLoading, state.hasError]);

  const toggleEnabled = useCallback((enabled: boolean) => {
    setIsEnabled(enabled);
    
    // Atualiza preferências do usuário
    const currentPreferences = audioPreferencesService.getPreferences();
    audioPreferencesService.updatePreferences({
      ...currentPreferences,
      backgroundMusicEnabled: enabled
    });
  }, []);

  const setVolume = useCallback((volume: number) => {
    backgroundMusicPlayer.setVolume(volume);
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    backgroundMusicPlayer.setMuted(muted);
  }, []);

  const refresh = useCallback(async () => {
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