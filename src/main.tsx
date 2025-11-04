import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { OfflineAudioService } from './services/offlineAudioService';
import { PWAService } from './services/pwaService';

// FASE 1: Limpeza agressiva de localStorage (migração PKCE)
// Remove sessões corrompidas que causam "403 bad_jwt: missing sub claim"
// MANTER POR 48h, depois remover
(() => {
  try {
    const keys = Object.keys(localStorage);
    const toRemove = keys.filter(
      k => k.startsWith('sb-') || k.includes('auth') || k.includes('supabase')
    );
    toRemove.forEach(k => localStorage.removeItem(k));
    // Compatibilidade com versão legada
    localStorage.removeItem('supabase.auth.token');
    console.log('[MIGRATION] Cleared auth storage:', toRemove.length, 'keys removed');
  } catch (e) {
    console.warn('[MIGRATION] Clear auth failed', e);
  }
})();

// Verificar se React está disponível globalmente antes de qualquer renderização
if (typeof window !== 'undefined') {
  (window as any).React = React;
  console.log('main.tsx: React definido globalmente');
}

console.log('main.tsx: Verificando React', {
  React: typeof React,
  version: React.version,
  windowReact: typeof (window as any).React,
  useRef: typeof React.useRef
});

// Inicializa serviços
OfflineAudioService.initialize();
PWAService.initialize();

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);