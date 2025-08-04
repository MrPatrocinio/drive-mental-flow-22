/**
 * Hook para monitorar status de conectividade
 * Segue o princípio SRP: apenas estado de conectividade
 */

import { useState, useEffect } from 'react';
import { OfflineStatusService, type ConnectionInfo } from '@/services/offlineStatusService';

export function useOfflineStatus() {
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>(() => 
    OfflineStatusService.getCurrentStatus()
  );

  useEffect(() => {
    const unsubscribe = OfflineStatusService.addListener(setConnectionInfo);
    return unsubscribe;
  }, []);

  return {
    isOnline: connectionInfo.isOnline,
    isOffline: !connectionInfo.isOnline,
    connectionStatus: connectionInfo.status,
    effectiveType: connectionInfo.effectiveType,
    downlink: connectionInfo.downlink,
    rtt: connectionInfo.rtt,
    connectionInfo
  };
}