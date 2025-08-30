import React from 'react';
import { createRoot } from 'react-dom/client';
import SimpleApp from './SimpleApp.tsx';
import './index.css';

// Debug: verificar React no main.tsx
console.log('main.tsx: Verificando React', { 
  React: typeof React, 
  version: React?.version,
  isAvailable: !!React 
});

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

const root = createRoot(container);

// Usar SimpleApp primeiro para testar React básico
console.log('main.tsx: Renderizando SimpleApp');
root.render(<SimpleApp />);