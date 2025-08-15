
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { OfflineAudioService } from './services/offlineAudioService'
import { PWAService } from './services/pwaService'

// Inicializa serviços
OfflineAudioService.initialize();
PWAService.initialize();

createRoot(document.getElementById("root")!).render(<App />);
