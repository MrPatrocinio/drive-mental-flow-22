
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { OfflineAudioService } from './services/offlineAudioService'
import { PWAService } from './services/pwaService'
import { DiagnosticService } from './services/diagnosticService'

// Inicializa diagnóstico
DiagnosticService.info('Main', 'Iniciando aplicação Drive Mental');

// Monitor de performance para carregamento da aplicação
const performanceMonitor = DiagnosticService.monitorPageLoad('App');

// Inicializa serviços
try {
  DiagnosticService.info('Main', 'Inicializando OfflineAudioService');
  OfflineAudioService.initialize();
  
  DiagnosticService.info('Main', 'Inicializando PWAService');
  PWAService.initialize();
  
  DiagnosticService.info('Main', 'Serviços inicializados com sucesso');
} catch (error) {
  DiagnosticService.error('Main', 'Erro ao inicializar serviços', error);
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  DiagnosticService.error('Main', 'Elemento root não encontrado');
  throw new Error('Elemento root não encontrado');
}

DiagnosticService.info('Main', 'Criando root da aplicação');
const root = createRoot(rootElement);

try {
  root.render(<App />);
  DiagnosticService.info('Main', 'Aplicação renderizada com sucesso');
  performanceMonitor(); // Finaliza monitor de performance
} catch (error) {
  DiagnosticService.error('Main', 'Erro ao renderizar aplicação', error);
  throw error;
}

// Diagnóstico após carregamento completo
window.addEventListener('load', () => {
  DiagnosticService.info('Main', 'Window load event disparado');
  setTimeout(() => {
    DiagnosticService.checkCommonIssues();
  }, 1000);
});
