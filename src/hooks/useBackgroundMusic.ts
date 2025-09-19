
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
    backgroundMusicPlayer.refresh().then(() => {
      console.log('useBackgroundMusic: Player refresh concluído com sucesso');
    }).catch(error => {
      console.error('useBackgroundMusic: Erro ao dar refresh no player:', error);
    });
    
    return unsubscribe;
  }, []);

  // Controle automático de reprodução baseado no contexto de áudio
  React.useEffect(() => {
    if (!isEnabled) {
      console.log('useBackgroundMusic: Background music desabilitado - pausando');
      backgroundMusicPlayer.pause();
      return;
    }

    // Busca preferências para verificar se deve mixar com áudio principal
    const preferences = audioPreferencesService.getPreferences();
    const shouldMix = preferences.backgroundMixWithMain;

    if (shouldMix || shouldPlayBackgroundMusic) {
      console.log('useBackgroundMusic: Contexto permite ou mix ativado - tentando tocar background music', {
        shouldMix,
        shouldPlayBackgroundMusic
      });
      backgroundMusicPlayer.play().catch(error => {
        console.error('useBackgroundMusic: Erro ao tentar tocar:', error);
      });
    } else {
      console.log('useBackgroundMusic: Contexto não permite e mix desativado - pausando background music');
      backgroundMusicPlayer.pause();
    }
  }, [isEnabled, shouldPlayBackgroundMusic]);

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
