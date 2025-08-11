
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
          
          // Tentar diferentes comandos de pausa para Video.js
          const pauseCommands = [
            { action: 'pause' },
            { command: 'pause' },
            { method: 'pause' },
            { videojs: { method: 'pause' } }
          ];

          pauseCommands.forEach(command => {
            try {
              iframeElement.contentWindow?.postMessage(JSON.stringify(command), '*');
            } catch (err) {
              // Ignorar erros de postMessage
            }
          });
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

    const isAtomicatVideo = activeVideo.type === 'atomicat';
    const isAtomicatHtml = isAtomicatVideo && VideoService.isAtomicatHtml(activeVideo.url);
    const isHLS = isAtomicatVideo && VideoService.isHLSStream(activeVideo.url);

    console.log('VideoLifecycle: Carregando novo vídeo:', {
      id: newVideoId,
      type: activeVideo.type,
      isAtomicatHtml,
      isHLS,
      hasScripts: isAtomicatHtml ? VideoService.extractAtomicatScripts(activeVideo.url).length > 0 : false
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

    // Para vídeos da Atomicat com HLS, aguardar mais tempo para scripts/player carregarem
    let loadingDelay = 100;
    
    if (isAtomicatVideo) {
      if (isHLS) {
        loadingDelay = 800; // HLS precisa de mais tempo
      } else if (isAtomicatHtml) {
        loadingDelay = 500; // HTML com scripts precisa de tempo médio
      } else {
        loadingDelay = 300; // URLs diretas precisam de menos tempo
      }
    }
    
    console.log('VideoLifecycle: Delay de carregamento definido:', {
      type: activeVideo.type,
      delay: loadingDelay,
      reason: isHLS ? 'HLS Stream' : isAtomicatHtml ? 'HTML with scripts' : isAtomicatVideo ? 'Atomicat URL' : 'Standard video'
    });
    
    // Aguardar antes de marcar como pronto
    cleanupTimeoutRef.current = setTimeout(() => {
      setIsVideoReady(true);
      console.log('VideoLifecycle: Vídeo pronto para reprodução', {
        type: activeVideo.type,
        delay: loadingDelay,
        isAtomicatVideo,
        isHLS
      });
    }, loadingDelay);

    // Cleanup no unmount
    return () => {
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }
    };
  }, [activeVideo?.id, activeVideo?.type, cleanupPreviousVideo]);

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
