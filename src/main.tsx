import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { OfflineAudioService } from './services/offlineAudioService'

// Inicializa o serviço offline
OfflineAudioService.initialize();

createRoot(document.getElementById("root")!).render(<App />);
