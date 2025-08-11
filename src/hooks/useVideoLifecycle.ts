
/**
 * useVideoLifecycle Hook
 * Responsabilidade: Gerenciar ciclo de vida dos vídeos na landing page
 * Princípio SRP: Apenas lógica de controle de vídeo lifecycle
 * Princípio DRY: Hook reutilizável para controle de vídeos
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { Video, VideoService } from '@/services/supabase/videoService';

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
    const existingIframes = document.querySelectorAll('iframe[src*="youtube.com"], iframe[srcDoc*="atomicat"], iframe[src*="atomicat"]');
    existingIframes.forEach(iframe => {
      try {
        const iframeElement = iframe as HTMLIFrameElement;
        
        // Pausar vídeo via postMessage se possível (YouTube)
        if (iframeElement.src?.includes('youtube.com')) {
          iframeElement.contentWindow?.postMessage(
            '{"event":"command","func":"pauseVideo","args":""}',
            '*'
          );
        }
        
        // Para Atomicat, tentar pausar via postMessage genérico
        if (iframeElement.src?.includes('atomicat') || iframeElement.getAttribute('srcDoc')?.includes('atomicat')) {
          console.log('VideoLifecycle: Limpando iframe da Atomicat');
          iframeElement.contentWindow?.postMessage(
            JSON.stringify({ action: 'pause' }),
            '*'
          );
        }
      } catch (error) {
        console.log('VideoLifecycle: Limpeza de vídeo message failed:', error);
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

    console.log('VideoLifecycle: Carregando novo vídeo:', {
      id: newVideoId,
      type: activeVideo.type,
      isAtomicatHtml: activeVideo.type === 'atomicat' ? VideoService.isAtomicatHtml(activeVideo.url) : false
    });

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

    // Para vídeos da Atomicat, aguardar um pouco mais para scripts carregarem
    const loadingDelay = activeVideo.type === 'atomicat' ? 300 : 100;
    
    // Aguardar antes de marcar como pronto
    cleanupTimeoutRef.current = setTimeout(() => {
      setIsVideoReady(true);
      console.log('VideoLifecycle: Vídeo pronto para reprodução', {
        type: activeVideo.type,
        delay: loadingDelay
      });
    }, loadingDelay);

    // Cleanup no unmount
    return () => {
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }
    };
  }, [activeVideo?.id, activeVideo?.type]); // Incluir tipo na dependência para debug

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
