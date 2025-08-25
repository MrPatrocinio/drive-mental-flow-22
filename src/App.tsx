
import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { dataSyncService } from '@/services/dataSync';
import LandingPage from '@/pages/LandingPage';
import DemoPage from '@/pages/DemoPage';
import UserLoginPage from '@/pages/UserLoginPage';
import Dashboard from '@/pages/Dashboard';
import FieldPage from '@/pages/FieldPage';
import AudioPlayerPage from '@/pages/AudioPlayerPage';
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
import { AudioPlaybackProvider } from '@/contexts/AudioPlaybackContext';
import { AdminProtectedRoute } from '@/components/AdminProtectedRoute';
import { UserProtectedRoute } from '@/components/UserProtectedRoute';

// Create a single client instance outside of the component
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Separate component for routes to ensure proper context nesting
const AppContent: React.FC = () => {
  React.useEffect(() => {
    console.log('App: Inicializando serviço de sincronização');
    dataSyncService.initialize();
  }, []);

  return (
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

      {/* Rota de Campo Protegida */}
      <Route path="/campo/:fieldId" element={
        <UserProtectedRoute>
          <FieldPage />
        </UserProtectedRoute>
      } />

      {/* Rotas de Audio Player Protegidas */}
      <Route path="/campo/:fieldId/audio/:audioId" element={
        <UserProtectedRoute>
          <AudioPlayerPage />
        </UserProtectedRoute>
      } />

      <Route path="/audio/:audioId" element={
        <UserProtectedRoute>
          <AudioPlayerPage />
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
  );
};

const App: React.FC = () => {
  console.log('App: Componente principal inicializando');
  
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <SupabaseAuthProvider>
          <AdminProvider>
            <UserProvider>
              <AudioPlaybackProvider>
                <AppContent />
              </AudioPlaybackProvider>
            </UserProvider>
          </AdminProvider>
        </SupabaseAuthProvider>
      </QueryClientProvider>
    </Router>
  );
};

export default App;
