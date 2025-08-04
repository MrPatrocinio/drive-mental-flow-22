/**
 * useBackgroundMusic Hook
 * Responsabilidade: Interface React para o player de música de fundo
 * Princípio SRP: Apenas lógica de hook para background music
 */

import { useState, useEffect, useCallback } from 'react';
import { backgroundMusicPlayer, BackgroundMusicState } from '@/services/backgroundMusicPlayerService';
import { audioPreferencesService } from '@/services/audioPreferencesService';
import { useAudioPlaybackSafe } from '@/contexts/AudioPlaybackContext';

export const useBackgroundMusic = () => {
  const [state, setState] = useState<BackgroundMusicState>(backgroundMusicPlayer.getState());
  const [isEnabled, setIsEnabled] = useState(false);
  
  // Obtém contexto com fallback seguro
  const audioPlaybackContext = useAudioPlaybackSafe();
  const shouldPlayBackgroundMusic = audioPlaybackContext?.shouldPlayBackgroundMusic || false;

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

  // Controla reprodução baseado no contexto de áudio principal
  useEffect(() => {
    console.log('useBackgroundMusic: Verificando estado para reprodução', {
      isEnabled,
      shouldPlayBackgroundMusic,
      isPlaying: state.isPlaying,
      isLoading: state.isLoading,
      hasError: state.hasError,
      currentMusic: state.currentMusic?.title
    });
    
    // Evita loops infinitos verificando se a ação é necessária
    if (isEnabled && shouldPlayBackgroundMusic) {
      if (!state.isPlaying && !state.isLoading && !state.hasError) {
        console.log('useBackgroundMusic: Iniciando reprodução (áudio principal ativo)');
        backgroundMusicPlayer.play();
      }
    } else {
      if (state.isPlaying) {
        console.log('useBackgroundMusic: Pausando reprodução');
        backgroundMusicPlayer.pause();
      }
    }
  }, [isEnabled, shouldPlayBackgroundMusic]);

  const toggleEnabled = useCallback((enabled: boolean) => {
    console.log('useBackgroundMusic: Toggle ativado:', enabled);
    setIsEnabled(enabled);
    
    // Atualiza preferências do usuário
    const currentPreferences = audioPreferencesService.getPreferences();
    audioPreferencesService.updatePreferences({
      ...currentPreferences,
      backgroundMusicEnabled: enabled
    });
  }, []);

  const setVolume = useCallback((volume: number) => {
    console.log('useBackgroundMusic: Definindo volume:', volume);
    backgroundMusicPlayer.setVolume(volume / 100);
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    console.log('useBackgroundMusic: Definindo mute:', muted);
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