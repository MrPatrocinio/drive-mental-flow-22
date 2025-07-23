import { useEffect } from 'react';
import { realtimeService, RealtimeCallbacks } from '@/services/realtimeService';

export const useRealtimeUpdates = (callbacks: RealtimeCallbacks) => {
  useEffect(() => {
    const unsubscribe = realtimeService.subscribe(callbacks);
    return unsubscribe;
  }, [callbacks]);
};

export default useRealtimeUpdates;