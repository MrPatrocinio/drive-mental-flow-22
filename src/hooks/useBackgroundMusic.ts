
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
  // Música de fundo sempre habilitada - sem controle do usuário final
  const [isEnabled] = React.useState(true);
  
  // Obtém contexto com fallback seguro
  const audioPlaybackContext = useAudioPlaybackSafe();
  const userIntentionPlaying = audioPlaybackContext?.userIntentionPlaying || false;

  // Garante que as preferências sempre tenham backgroundMusicEnabled = true
  React.useEffect(() => {
    const preferences = audioPreferencesService.getPreferences();
    if (preferences.backgroundMusicEnabled !== true) {
      audioPreferencesService.updatePreferences({
        ...preferences,
        backgroundMusicEnabled: true
      });
    }
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

  // Coordenação de estado baseado no SSOT (apenas PAUSE, não PLAY)
  React.useEffect(() => {
    // SSOT: Música de fundo só deve tocar se usuário quer que voz toque E música está habilitada
    const shouldPlay = userIntentionPlaying && isEnabled;
    
    console.log('useBackgroundMusic: Coordenação SSOT:', {
      userIntentionPlaying,
      isEnabled,
      shouldPlay
    });

    // Apenas pausar quando condições não são atendidas
    // O PLAY inicial é feito no AudioPlayer dentro do mesmo gesto de usuário
    if (!shouldPlay) {
      console.log('useBackgroundMusic: SSOT não permite - pausando background music');
      backgroundMusicPlayer.pause();
    } else {
      console.log('useBackgroundMusic: SSOT permite - música pode tocar (controle via gesto de usuário)');
    }
  }, [userIntentionPlaying, isEnabled]);

  // Funções simplificadas - sem toggle para o usuário final
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
    isEnabled, // Sempre true
    setVolume,
    setMuted,
    refresh
  };
};
