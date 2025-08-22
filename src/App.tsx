
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
import UserLoginPage from '@/pages/UserLoginPage';
import Dashboard from '@/pages/Dashboard';
import { AdminSubscriptionPlansPage } from '@/pages/admin/AdminSubscriptionPlansPage';
import { AdminPricingPage } from '@/pages/admin/AdminPricingPage';
import { AdminBackgroundMusicPage } from '@/pages/admin/AdminBackgroundMusicPage';
import { AdminAnalyticsPage } from '@/pages/admin/AdminAnalyticsPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminLoginPage from '@/pages/admin/AdminLoginPage';
import AdminLandingPage from '@/pages/admin/AdminLandingPage';
import AdminFieldsPageNew from '@/pages/admin/AdminFieldsPageNew';
import AdminAudiosPageNew from '@/pages/admin/AdminAudiosPageNew';
import { AdminStatsPage } from '@/pages/admin/AdminStatsPage';
import { AdminValidationPage } from '@/pages/admin/AdminValidationPage';
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';
import { AdminProvider } from '@/contexts/AdminContext';
import { UserProvider } from '@/contexts/UserContext';
import { AdminProtectedRoute } from '@/components/AdminProtectedRoute';
import { UserProtectedRoute } from '@/components/UserProtectedRoute';

function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Inicializar o serviço de sincronização
    dataSyncService.initialize();
  }, []);

  return <>{children}</>;
}

export default function App() {
  return (
    <SupabaseAuthProvider>
      <UserProvider>
        <AdminProvider>
          <Router>
            <AuthProvider>
              <Routes>
                {/* Rotas Públicas */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/demo" element={<DemoPage />} />

                {/* Rota de Login de Usuários */}
                <Route path="/login" element={<UserLoginPage />} />

                {/* Rotas de Usuários Protegidas */}
                <Route path="/dashboard" element={
                  <UserProtectedRoute>
                    <Dashboard />
                  </UserProtectedRoute>
                } />

                {/* Rota de Login Administrativo */}
                <Route path="/admin/login" element={<AdminLoginPage />} />

                {/* Rotas Administrativas Protegidas */}
                <Route path="/admin" element={
                  <AdminProtectedRoute>
                    <AdminDashboard />
                  </AdminProtectedRoute>
                } />
                
                <Route path="/admin/landing" element={
                  <AdminProtectedRoute>
                    <AdminLandingPage />
                  </AdminProtectedRoute>
                } />
                
                <Route path="/admin/pricing" element={
                  <AdminProtectedRoute>
                    <AdminPricingPage />
                  </AdminProtectedRoute>
                } />
                
                <Route path="/admin/subscription-plans" element={
                  <AdminProtectedRoute>
                    <AdminSubscriptionPlansPage />
                  </AdminProtectedRoute>
                } />
                
                <Route path="/admin/fields" element={
                  <AdminProtectedRoute>
                    <AdminFieldsPageNew />
                  </AdminProtectedRoute>
                } />
                
                <Route path="/admin/audios" element={
                  <AdminProtectedRoute>
                    <AdminAudiosPageNew />
                  </AdminProtectedRoute>
                } />
                
                <Route path="/admin/background-music" element={
                  <AdminProtectedRoute>
                    <AdminBackgroundMusicPage />
                  </AdminProtectedRoute>
                } />
                
                <Route path="/admin/stats" element={
                  <AdminProtectedRoute>
                    <AdminStatsPage />
                  </AdminProtectedRoute>
                } />
                
                <Route path="/admin/analytics" element={
                  <AdminProtectedRoute>
                    <AdminAnalyticsPage />
                  </AdminProtectedRoute>
                } />
                
                <Route path="/admin/validation" element={
                  <AdminProtectedRoute>
                    <AdminValidationPage />
                  </AdminProtectedRoute>
                } />
              </Routes>
            </AuthProvider>
          </Router>
        </AdminProvider>
      </UserProvider>
    </SupabaseAuthProvider>
  );
}
