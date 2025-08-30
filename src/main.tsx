import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { OfflineAudioService } from './services/offlineAudioService';
import { PWAService } from './services/pwaService';

// Verificar se React está disponível globalmente
if (typeof window !== 'undefined') {
  (window as any).React = React;
}

console.log('main.tsx: Verificando React', {
  React: typeof React,
  version: React.version,
  windowReact: typeof (window as any).React
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