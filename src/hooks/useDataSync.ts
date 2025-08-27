
/**
 * useDataSync Hook
 * Responsabilidade: Interface React para sincronização de dados
 * Princípio SRP: Apenas lógica de hook
 * Princípio DRY: Hook reutilizável para qualquer componente
 * OTIMIZADO: Evita re-renders desnecessários
 */

import { useEffect, useCallback, useRef } from 'react';
import { dataSyncService, DataChangeEvent } from '@/services/dataSync';

interface DataSyncCallbacks {
  onFieldsChange?: () => void;
  onAudiosChange?: () => void;
  onContentChange?: () => void;
  onVideosChange?: () => void;
}

export const useDataSync = (callbacks?: DataSyncCallbacks) => {
  // Usar ref para manter referência estável das callbacks
  const callbacksRef = useRef(callbacks);
  
  // Atualizar ref quando callbacks mudarem
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  const handleDataChange = useCallback((event: DataChangeEvent, payload?: any) => {
    console.log('Data sync event received:', event, payload);
    
    // Executar callbacks específicos se fornecidos
    const currentCallbacks = callbacksRef.current;
    if (currentCallbacks) {
      switch (event) {
        case 'fields_changed':
          currentCallbacks.onFieldsChange?.();
          break;
        case 'audios_changed':
          currentCallbacks.onAudiosChange?.();
          break;
        case 'content_changed':
          currentCallbacks.onContentChange?.();
          break;
        case 'videos_changed':
          currentCallbacks.onVideosChange?.();
          break;
      }
    }
  }, []); // Dependências vazias pois usamos ref

  useEffect(() => {
    const unsubscribe = dataSyncService.subscribe(handleDataChange);
    
    return () => {
      dataSyncService.unsubscribe(unsubscribe);
    };
  }, [handleDataChange]);

  // Removido syncTrigger para evitar re-renders desnecessários
  return {};
};
