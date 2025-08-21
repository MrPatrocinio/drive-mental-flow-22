
import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom';
import { dataSyncService } from '@/services/dataSync';
import LandingPage from '@/pages/LandingPage';
import DemoPage from '@/pages/DemoPage';
import { AdminSubscriptionPlansPage } from '@/pages/admin/AdminSubscriptionPlansPage';
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';

export default function App() {
  return (
    <Router>
      <SupabaseAuthProvider>
        <AuthProvider>
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/demo" element={<DemoPage />} />

            {/* Rotas Administrativas */}
            <Route path="/admin/subscription-plans" element={<AdminSubscriptionPlansPage />} />
          </Routes>
        </AuthProvider>
      </SupabaseAuthProvider>
    </Router>
  );
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Inicializar o serviço de sincronização
    dataSyncService.initialize();
  }, []);

  return <>{children}</>;
}
