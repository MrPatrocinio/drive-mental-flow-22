/**
 * useDataSync Hook
 * Responsabilidade: Interface React para sincronização de dados
 * Princípio SRP: Apenas lógica de hook
 * Princípio DRY: Hook reutilizável para qualquer componente
 */

import { useEffect, useCallback } from 'react';
import { dataSyncService, DataChangeEvent } from '@/services/dataSync';

interface DataSyncCallbacks {
  onFieldsChange?: () => void;
  onAudiosChange?: () => void;
  onContentChange?: () => void;
  onVideosChange?: () => void;
}

export const useDataSync = (callbacks: DataSyncCallbacks) => {
  const handleDataChange = useCallback((event: DataChangeEvent, payload?: any) => {
    switch (event) {
      case 'fields_changed':
        callbacks.onFieldsChange?.();
        break;
      case 'audios_changed':
        callbacks.onAudiosChange?.();
        break;
      case 'content_changed':
        callbacks.onContentChange?.();
        break;
      case 'videos_changed':
        callbacks.onVideosChange?.();
        break;
    }
  }, [callbacks.onFieldsChange, callbacks.onAudiosChange, callbacks.onContentChange, callbacks.onVideosChange]);

  useEffect(() => {
    const unsubscribe = dataSyncService.subscribe(handleDataChange);
    
    return () => {
      dataSyncService.unsubscribe(unsubscribe);
    };
  }, [handleDataChange]);
};