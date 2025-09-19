
/**
 * Hook para funcionalidades PWA
 * Segue o princípio SRP: apenas estado e ações PWA
 */

import { useState, useEffect } from 'react';
import { PWAService, type PWACapabilities } from '@/services/pwaService';

export function usePWA() {
  const [capabilities, setCapabilities] = useState<PWACapabilities>(() => 
    PWAService.getCapabilities()
  );
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    const unsubscribe = PWAService.addCapabilitiesListener(setCapabilities);
    return unsubscribe;
  }, []);

  const installApp = async (): Promise<boolean> => {
    setIsInstalling(true);
    try {
      const result = await PWAService.showInstallPrompt();
      return result;
    } finally {
      setIsInstalling(false);
    }
  };

  const updateApp = async (): Promise<void> => {
    await PWAService.updateServiceWorker();
  };

  const clearCache = async (): Promise<void> => {
    await PWAService.clearCache();
  };

  return {
    ...capabilities,
    isInstalling,
    installApp,
    updateApp,
    clearCache,
    iosInstructions: PWAService.getIOSInstallInstructions(),
    updateDismissStatus: PWAService.updateDismissStatus
  };
}
