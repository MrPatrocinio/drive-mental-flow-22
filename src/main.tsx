
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { OfflineAudioService } from './services/offlineAudioService';
import { PWAService } from './services/pwaService';

// Inicializa serviços
OfflineAudioService.initialize();
PWAService.initialize();

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

const root = createRoot(container);
root.render(<App />);
