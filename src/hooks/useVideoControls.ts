
/**
 * useVideoControls Hook
 * Responsabilidade: Lógica para aplicação de controles de vídeo
 * Princípio SRP: Apenas lógica de controles de vídeo
 * Princípio DRY: Hook reutilizável para qualquer componente que exiba vídeos
 */

import React from 'react';
import { VideoControls } from '@/services/supabase/videoService';

interface VideoControlsHookResult {
  shouldShowOverlay: boolean;
  allowFullscreen: boolean;
  preventContextMenu: boolean;
  pointerEvents: 'auto' | 'none';
}

export const useVideoControls = (controls?: VideoControls): VideoControlsHookResult => {
  return React.useMemo(() => {
    if (!controls) {
      return {
        shouldShowOverlay: false,
        allowFullscreen: true,
        preventContextMenu: false,
        pointerEvents: 'auto'
      };
    }

    const shouldShowOverlay = !controls.showControls;
    const allowFullscreen = controls.allowFullscreen;
    const preventContextMenu = !controls.showControls;
    const pointerEvents = controls.showControls ? 'auto' : 'none';

    return {
      shouldShowOverlay,
      allowFullscreen,
      preventContextMenu,
      pointerEvents
    };
  }, [controls]);
};
