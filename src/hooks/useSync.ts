/**
 * useSync Hook - Responsável por facilitar o uso da sincronização
 * Responsabilidade: Interface hook para sincronização
 * Princípio SRP: Apenas lógica de hook de sincronização
 * Princípio DRY: Hook reutilizável
 */

import { useEffect, useCallback } from "react";
import { SyncService } from "@/services/syncService";

type SyncEventType = 'audios_updated' | 'fields_updated' | 'content_updated';

export const useSync = (
  onSyncEvent: (eventType: SyncEventType, data?: any) => void,
  eventTypes: SyncEventType[] = ['audios_updated', 'fields_updated', 'content_updated']
) => {
  const stableEventTypes = useCallback(() => eventTypes, [JSON.stringify(eventTypes)]);
  
  useEffect(() => {
    const syncId = SyncService.subscribe((eventType, data) => {
      if (stableEventTypes().includes(eventType)) {
        onSyncEvent(eventType, data);
      }
    });

    return () => SyncService.unsubscribe(syncId);
  }, [onSyncEvent, stableEventTypes]);

  const forceSync = useCallback(() => {
    SyncService.forceSync();
  }, []);

  return { forceSync };
};