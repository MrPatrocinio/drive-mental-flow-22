
/**
 * useDataSync Hook
 * Responsabilidade: Interface React para sincronização de dados
 * Princípio SRP: Apenas lógica de hook
 * Princípio DRY: Hook reutilizável para qualquer componente
 */

import React, { useEffect, useCallback, useState } from 'react';
import { dataSyncService, DataChangeEvent } from '@/services/dataSync';

interface DataSyncCallbacks {
  onFieldsChange?: () => void;
  onAudiosChange?: () => void;
  onContentChange?: () => void;
  onVideosChange?: () => void;
}

export const useDataSync = (callbacks?: DataSyncCallbacks) => {
  const [syncTrigger, setSyncTrigger] = React.useState(0);

  const handleDataChange = useCallback((event: DataChangeEvent, payload?: any) => {
    console.log('Data sync event received:', event, payload);
    
    // Incrementa o trigger para forçar re-renderização
    setSyncTrigger(prev => prev + 1);
    
    // Executa callbacks específicos se fornecidos
    if (callbacks) {
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
    }
  }, [callbacks]);

  React.useEffect(() => {
    const unsubscribe = dataSyncService.subscribe(handleDataChange);
    
    return () => {
      dataSyncService.unsubscribe(unsubscribe);
    };
  }, [handleDataChange]);

  return {
    syncTrigger
  };
};
