import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  BrowserRouter,
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
import LgpdPage from '@/pages/LgpdPage';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage';
import TermsOfServicePage from '@/pages/TermsOfServicePage';
import { SubscriptionPage } from '@/pages/SubscriptionPage';
import PaymentPage from '@/pages/PaymentPage';
import PaymentSuccessPage from '@/pages/PaymentSuccessPage';
import PaymentCancelPage from '@/pages/PaymentCancelPage';
import { AdminSubscriptionPlansPage } from '@/pages/admin/AdminSubscriptionPlansPage';
import { AdminPricingPage } from '@/pages/admin/AdminPricingPage';
import { AdminBackgroundMusicPage } from '@/pages/admin/AdminBackgroundMusicPage';
import { AdminAnalyticsPage } from '@/pages/admin/AdminAnalyticsPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminLoginPage from '@/pages/admin/AdminLoginPage';
import AdminLandingPage from '@/pages/admin/AdminLandingPage';
import AdminLandingVideosPage from '@/pages/admin/AdminLandingVideosPage';
import AdminFieldsPageNew from '@/pages/admin/AdminFieldsPageNew';
import AdminAudiosPageNew from '@/pages/admin/AdminAudiosPageNew';
import { AdminStatsPage } from '@/pages/admin/AdminStatsPage';
import { AdminValidationPage } from '@/pages/admin/AdminValidationPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import AdminCommunicationPage from '@/pages/admin/AdminCommunicationPage';
import AdminFinancialPage from '@/pages/admin/AdminFinancialPage';
import AdminAnalyticsAdvancedPage from '@/pages/admin/AdminAnalyticsAdvancedPage';
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';
import { AdminProvider } from '@/contexts/AdminContext';
import { UserProvider } from '@/contexts/UserContext';
import { AudioPlaybackProvider } from '@/contexts/AudioPlaybackContext';
import { AdminProtectedRoute } from '@/components/AdminProtectedRoute';
import { UserProtectedRoute } from '@/components/UserProtectedRoute';
import { useAnalytics } from '@/hooks/useAnalytics';
import { PWAPreferencesService } from '@/services/pwaPreferencesService';
import { usePWABoot } from '@/hooks/usePWABoot';
import NotFound from '@/pages/NotFound';
import { InscricaoPage } from '@/pages/InscricaoPage';
import { ObrigadoPage } from '@/pages/ObrigadoPage';

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
  const location = useLocation();
  const { isChecking, shouldShowContent } = usePWABoot();
  
  // Inicializar analytics para rastrear navegação automática
  useAnalytics();

  // Inicializar serviço de sincronização
  React.useEffect(() => {
    console.log('App: Inicializando serviço de sincronização');
    dataSyncService.initialize();
  }, []);

  // Mostrar loading durante verificação PWA/Auth
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Só renderizar conteúdo após verificações
  if (!shouldShowContent) {
    return null;
  }

  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/demo" element={<DemoPage />} />
      <Route path="/assinatura" element={<SubscriptionPage />} />
      <Route path="/pagamento" element={<PaymentPage />} />
      <Route path="/pagamento/sucesso" element={<PaymentSuccessPage />} />
      <Route path="/pagamento/cancelado" element={<PaymentCancelPage />} />
      
      {/* Páginas Legais */}
      <Route path="/lgpd" element={<LgpdPage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsOfServicePage />} />
      
      {/* Página de Inscrição */}
      <Route path="/inscricao" element={<InscricaoPage />} />
      
      {/* Página de Obrigado */}
      <Route path="/obrigado" element={<ObrigadoPage />} />

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
      
      <Route path="/admin/users" element={
        <AdminProtectedRoute>
          <AdminUsersPage />
        </AdminProtectedRoute>
      } />
      
      <Route path="/admin/communication" element={
        <AdminProtectedRoute>
          <AdminCommunicationPage />
        </AdminProtectedRoute>
      } />
      
      <Route path="/admin/financial" element={
        <AdminProtectedRoute>
          <AdminFinancialPage />
        </AdminProtectedRoute>
      } />
      
      <Route path="/admin/analytics-advanced" element={
        <AdminProtectedRoute>
          <AdminAnalyticsAdvancedPage />
        </AdminProtectedRoute>
      } />
      
      <Route path="/admin/landing" element={
        <AdminProtectedRoute>
          <AdminLandingPage />
        </AdminProtectedRoute>
      } />
      
      <Route path="/admin/landing-videos" element={
        <AdminProtectedRoute>
          <AdminLandingVideosPage />
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
      
      {/* Rota Catch-All para 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App: React.FC = () => {
  console.log('App: Inicializando', { 
    React: typeof React, 
    version: React.version,
    BrowserRouter: typeof BrowserRouter 
  });
  
  // Verificar React Context globalmente antes de renderizar
  React.useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).React) {
      (window as any).React = React;
      console.log('App: React definido globalmente');
    }
  }, []);
  
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
};

export default App;