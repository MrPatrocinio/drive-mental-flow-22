
/**
 * PWA Service - Responsável por funcionalidades de Progressive Web App
 * Segue o princípio SRP: apenas funcionalidades PWA
 */

export interface PWAInstallPrompt {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PWACapabilities {
  isInstallable: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  supportsInstall: boolean;
  platform: 'ios' | 'android' | 'desktop' | 'unknown';
}

export type PWAEventListener = (capabilities: PWACapabilities) => void;

export class PWAService {
  private static deferredPrompt: PWAInstallPrompt | null = null;
  private static listeners: Set<PWAEventListener> = new Set();
  private static capabilities: PWACapabilities = {
    isInstallable: false,
    isInstalled: false,
    isStandalone: false,
    supportsInstall: false,
    platform: 'unknown'
  };

  /**
   * Inicializa o serviço PWA
   */
  static initialize(): void {
    this.detectCapabilities();
    this.registerServiceWorker();
    this.setupEventListeners();
    this.checkInstallability();
  }

  /**
   * Detecta capacidades do dispositivo
   */
  private static detectCapabilities(): void {
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Detecta plataforma
    if (/iphone|ipad|ipod/.test(userAgent)) {
      this.capabilities.platform = 'ios';
    } else if (/android/.test(userAgent)) {
      this.capabilities.platform = 'android';
    } else if (/windows|mac|linux/.test(userAgent)) {
      this.capabilities.platform = 'desktop';
    }

    // Verifica se está em modo standalone
    this.capabilities.isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    // Verifica se já está instalado
    this.capabilities.isInstalled = this.capabilities.isStandalone;

    // Verifica suporte a instalação
    this.capabilities.supportsInstall = 
      'serviceWorker' in navigator && 
      'BeforeInstallPromptEvent' in window;

    this.notifyListeners();
  }

  /**
   * Registra o service worker
   */
  private static async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registrado:', registration.scope);

        // Verifica atualizações
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.showUpdateAvailable();
              }
            });
          }
        });

      } catch (error) {
        console.error('Erro ao registrar Service Worker:', error);
      }
    }
  }

  /**
   * Configura event listeners
   */
  private static setupEventListeners(): void {
    // Listener para prompt de instalação
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as unknown as PWAInstallPrompt;
      this.capabilities.isInstallable = true;
      this.notifyListeners();
    });

    // Listener para instalação bem-sucedida
    window.addEventListener('appinstalled', () => {
      console.log('PWA instalado com sucesso');
      this.deferredPrompt = null;
      this.capabilities.isInstalled = true;
      this.capabilities.isInstallable = false;
      this.notifyListeners();
    });

    // Listener para mudanças no display mode
    window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
      this.capabilities.isStandalone = e.matches;
      this.capabilities.isInstalled = e.matches;
      this.notifyListeners();
    });
  }

  /**
   * Verifica se o app pode ser instalado
   */
  private static checkInstallability(): void {
    // Para iOS Safari
    if (this.capabilities.platform === 'ios' && !this.capabilities.isStandalone) {
      this.capabilities.isInstallable = true;
      this.notifyListeners();
    }
  }

  /**
   * Mostra prompt de instalação
   */
  static async showInstallPrompt(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      console.log('Resultado da instalação:', outcome);
      
      this.deferredPrompt = null;
      this.capabilities.isInstallable = false;
      this.notifyListeners();

      return outcome === 'accepted';
    } catch (error) {
      console.error('Erro ao mostrar prompt de instalação:', error);
      return false;
    }
  }

  /**
   * Obtém instruções de instalação para iOS
   */
  static getIOSInstallInstructions(): string[] {
    return [
      'Toque no ícone de compartilhamento na parte inferior da tela',
      'Role para baixo e toque em "Adicionar à Tela de Início"',
      'Toque em "Adicionar" no canto superior direito'
    ];
  }

  /**
   * Adiciona listener para mudanças nas capacidades
   */
  static addCapabilitiesListener(listener: PWAEventListener): () => void {
    this.listeners.add(listener);
    listener(this.capabilities);

    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Obtém capacidades atuais
   */
  static getCapabilities(): PWACapabilities {
    return { ...this.capabilities };
  }

  /**
   * Notifica todos os listeners
   */
  private static notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.capabilities);
      } catch (error) {
        console.error('Erro ao notificar listener PWA:', error);
      }
    });
  }

  /**
   * Mostra notificação de atualização disponível
   */
  private static showUpdateAvailable(): void {
    // Pode ser integrado com sistema de notificações
    console.log('Nova versão disponível! Recarregue a página para atualizar.');
  }

  /**
   * Força atualização do service worker
   */
  static async updateServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      }
    }
  }

  /**
   * Limpa cache do PWA
   */
  static async clearCache(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('Cache do PWA limpo');
    }
  }
}
