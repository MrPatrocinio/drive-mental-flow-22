
/**
 * useBackgroundMusic Hook
 * Responsabilidade: Interface React para consumir estado de música de fundo
 * Princípio SRP: Apenas interface para acesso ao estado centralizado
 * Princípio SSOT: Consome estado do AudioPlaybackContext
 */

import { useAudioPlayback } from '@/contexts/AudioPlaybackContext';

export const useBackgroundMusic = () => {
  const context = useAudioPlayback();
  
  if (!context) {
    throw new Error('useBackgroundMusic must be used within AudioPlaybackProvider');
  }

  return {
    state: context.backgroundMusicState,
    isEnabled: context.isBackgroundMusicEnabled,
    toggleEnabled: context.toggleBackgroundMusic,
    setVolume: context.setBackgroundVolume,
    setMuted: context.setBackgroundMuted,
    refresh: context.refreshBackgroundMusic
  };
};
