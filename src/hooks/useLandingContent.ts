
/**
 * useLandingContent Hook
 * Responsabilidade: Interface React para conteúdo da landing page (princípio SRP)
 * Princípio DRY: Hook reutilizável para qualquer componente que precise do conteúdo
 */

import { useState, useEffect, useCallback } from 'react';
import { landingContentService, LandingPageContent } from '@/services/landingContentService';
import { realtimeLandingService } from '@/services/realtimeLandingService';
import { syncDiagnostics } from '@/services/syncDiagnostics';

interface UseLandingContentReturn {
  content: LandingPageContent | null;
  loading: boolean;
  error: string | null;
  refreshContent: () => Promise<void>;
}

export const useLandingContent = (): UseLandingContentReturn => {
  const [content, setContent] = useState<LandingPageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadContent = useCallback(async (forceRefresh = false) => {
    try {
      setError(null);
      if (forceRefresh) {
        setLoading(true);
      }

      syncDiagnostics.log('hook_loading_content', 'success', { forceRefresh });
      
      const landingContent = await landingContentService.getLandingPageContent(forceRefresh);
      setContent(landingContent);
      
      syncDiagnostics.log('hook_content_loaded', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      syncDiagnostics.log('hook_load_error', 'error', { error: errorMessage });
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshContent = useCallback(async () => {
    await loadContent(true);
  }, [loadContent]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  useEffect(() => {
    const unsubscribe = realtimeLandingService.subscribe(() => {
      syncDiagnostics.log('hook_received_realtime_update', 'success');
      loadContent(true);
    });

    return unsubscribe;
  }, [loadContent]);

  return {
    content,
    loading,
    error,
    refreshContent
  };
};
