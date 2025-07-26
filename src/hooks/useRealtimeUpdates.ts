
import { useEffect, useCallback } from 'react';
import { realtimeService, RealtimeCallbacks } from '@/services/realtimeService';

export const useRealtimeUpdates = (callbacks: RealtimeCallbacks) => {
  // Memoize callbacks to prevent unnecessary re-subscriptions
  const memoizedCallbacks = useCallback(() => ({
    onFieldsChange: callbacks.onFieldsChange,
    onAudiosChange: callbacks.onAudiosChange,
    onLandingContentChange: callbacks.onLandingContentChange
  }), [callbacks.onFieldsChange, callbacks.onAudiosChange, callbacks.onLandingContentChange]);

  useEffect(() => {
    console.log('useRealtimeUpdates: Configurando subscription');
    const unsubscribe = realtimeService.subscribe(memoizedCallbacks());
    
    return () => {
      console.log('useRealtimeUpdates: Limpando subscription');
      unsubscribe();
    };
  }, [memoizedCallbacks]);
};

export default useRealtimeUpdates;
