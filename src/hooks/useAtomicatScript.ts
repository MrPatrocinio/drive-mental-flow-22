
/**
 * useAtomicatScript Hook
 * Responsabilidade: Carregar dinamicamente scripts da Atomicat
 * Princípio SRP: Apenas gerenciamento de scripts Atomicat
 */

import { useEffect, useState, useCallback } from 'react';
import { VideoService } from '@/services/supabase/videoService';

interface AtomicatScriptResult {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  loadScripts: (htmlContent: string) => Promise<void>;
}

export const useAtomicatScript = (): AtomicatScriptResult => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedScripts, setLoadedScripts] = useState<Set<string>>(new Set());

  const loadScript = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Verificar se script já foi carregado
      if (loadedScripts.has(src) || document.querySelector(`script[src="${src}"]`)) {
        console.log('AtomicatScript: Script já carregado:', src);
        resolve();
        return;
      }

      console.log('AtomicatScript: Carregando script:', src);

      const script = document.createElement('script');
      script.src = src;
      script.defer = true;
      
      script.onload = () => {
        console.log('AtomicatScript: Script carregado com sucesso:', src);
        setLoadedScripts(prev => new Set(prev).add(src));
        resolve();
      };

      script.onerror = (err) => {
        console.error('AtomicatScript: Erro ao carregar script:', src, err);
        reject(new Error(`Falha ao carregar script: ${src}`));
      };

      document.head.appendChild(script);
    });
  }, [loadedScripts]);

  const loadScripts = useCallback(async (htmlContent: string): Promise<void> => {
    if (!VideoService.isAtomicatHtml(htmlContent)) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const scripts = VideoService.extractAtomicatScripts(htmlContent);
      
      if (scripts.length === 0) {
        console.log('AtomicatScript: Nenhum script encontrado no HTML');
        setIsLoaded(true);
        return;
      }

      console.log('AtomicatScript: Carregando scripts da Atomicat:', scripts);

      // Carregar scripts em sequência
      for (const scriptUrl of scripts) {
        await loadScript(scriptUrl);
      }

      // Aguardar um pouco para garantir que Video.js seja inicializado
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verificar se Video.js está disponível globalmente
      if (typeof (window as any).videojs !== 'undefined') {
        console.log('AtomicatScript: Video.js está disponível globalmente');
      }

      setIsLoaded(true);
      console.log('AtomicatScript: Todos os scripts carregados com sucesso');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('AtomicatScript: Erro ao carregar scripts:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [loadScript]);

  // Cleanup: remover scripts quando componente for desmontado
  useEffect(() => {
    return () => {
      // Não remover scripts pois podem ser reutilizados
      console.log('AtomicatScript: Hook desmontado');
    };
  }, []);

  return {
    isLoaded,
    isLoading,
    error,
    loadScripts
  };
};
