/**
 * useVideoLifecycle Hook
 * Responsabilidade: Gerenciar ciclo de vida dos vídeos na landing page
 * Princípio SRP: Apenas lógica de controle de vídeo lifecycle
 * Princípio DRY: Hook reutilizável para controle de vídeos
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { Video } from '@/services/supabase/videoService';

interface VideoLifecycleResult {
  isVideoReady: boolean;
  videoKey: string;
  cleanupPreviousVideo: () => void;
}

export const useVideoLifecycle = (activeVideo: Video | null): VideoLifecycleResult => {
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [videoKey, setVideoKey] = useState('');
  const currentVideoRef = useRef<string | null>(null);
  const cleanupTimeoutRef = useRef<NodeJS.Timeout>();
  const isCleaningRef = useRef(false);

  const cleanupPreviousVideo = useCallback(() => {
    // Evitar execuções múltiplas simultâneas
    if (isCleaningRef.current) {
      return;
    }
    
    isCleaningRef.current = true;
    
    // Limpar timeout anterior se existir
    if (cleanupTimeoutRef.current) {
      clearTimeout(cleanupTimeoutRef.current);
    }
    
    // Forçar limpeza de iframes anteriores
    const existingIframes = document.querySelectorAll('iframe[src*="youtube.com"]');
    existingIframes.forEach(iframe => {
      try {
        // Pausar vídeo via postMessage se possível
        (iframe as HTMLIFrameElement).contentWindow?.postMessage(
          '{"event":"command","func":"pauseVideo","args":""}',
          '*'
        );
      } catch (error) {
        console.log('Video cleanup message failed:', error);
      }
    });

    console.log('VideoLifecycle: Limpeza de vídeo anterior executada');
    
    // Reset flag após um delay
    setTimeout(() => {
      isCleaningRef.current = false;
    }, 100);
  }, []);

  useEffect(() => {
    if (!activeVideo) {
      setIsVideoReady(false);
      setVideoKey('');
      currentVideoRef.current = null;
      return;
    }

    // Verificar se é um vídeo diferente
    const newVideoId = activeVideo.id;
    if (currentVideoRef.current === newVideoId && isVideoReady) {
      return; // Mesmo vídeo já carregado, não fazer nada
    }

    console.log('VideoLifecycle: Carregando novo vídeo:', newVideoId);

    // Resetar estado primeiro
    setIsVideoReady(false);
    
    // Limpar vídeo anterior apenas se necessário
    if (currentVideoRef.current && currentVideoRef.current !== newVideoId) {
      cleanupPreviousVideo();
    }

    // Gerar nova key para forçar remontagem do iframe
    const newKey = `video-${newVideoId}-${Date.now()}`;
    setVideoKey(newKey);
    currentVideoRef.current = newVideoId;

    // Aguardar um pouco antes de marcar como pronto
    cleanupTimeoutRef.current = setTimeout(() => {
      setIsVideoReady(true);
      console.log('VideoLifecycle: Vídeo pronto para reprodução');
    }, 100);

    // Cleanup no unmount
    return () => {
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }
    };
  }, [activeVideo?.id]); // Apenas dependência do ID do vídeo

  // Cleanup geral no unmount do componente
  useEffect(() => {
    return () => {
      cleanupPreviousVideo();
    };
  }, [cleanupPreviousVideo]);

  return {
    isVideoReady,
    videoKey,
    cleanupPreviousVideo
  };
};