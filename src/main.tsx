import { createRoot } from 'react-dom/client';
import TestApp from './TestApp';

console.log('=== INICIO DEBUG MAIN.TSX ===');
console.log('Versão mínima para isolar problema React');

const container = document.getElementById("root");
if (!container) {
  console.error('Container root não encontrado');
  throw new Error("Root element not found");
}

console.log('Container encontrado:', container);

try {
  const root = createRoot(container);
  console.log('Root criado com sucesso');
  
  root.render(TestApp());
  console.log('TestApp renderizado com sucesso');
} catch (error) {
  console.error('ERRO durante renderização:', error);
  
  // Fallback: renderização HTML pura
  container.innerHTML = `
    <div style="padding: 20px; background: #ffe6e6; border: 2px solid #ff0000;">
      <h1>🚨 ERRO CRÍTICO</h1>
      <p>Erro durante renderização React: ${error}</p>
      <p>Timestamp: ${new Date().toISOString()}</p>
    </div>
  `;
}