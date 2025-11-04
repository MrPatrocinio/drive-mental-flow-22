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
import PaymentProcessingPage from '@/pages/PaymentProcessingPage';
import SubscriptionSuccessPage from '@/pages/SubscriptionSuccessPage';
import OnboardingPage from '@/pages/OnboardingPage';
// Lazy load admin pages para reduzir bundle inicial
const AdminSubscriptionPlansPage = React.lazy(() => import('@/pages/admin/AdminSubscriptionPlansPage').then(m => ({ default: m.AdminSubscriptionPlansPage })));
const AdminPricingPage = React.lazy(() => import('@/pages/admin/AdminPricingPage').then(m => ({ default: m.AdminPricingPage })));
const AdminBackgroundMusicPage = React.lazy(() => import('@/pages/admin/AdminBackgroundMusicPage').then(m => ({ default: m.AdminBackgroundMusicPage })));
const AdminAnalyticsPage = React.lazy(() => import('@/pages/admin/AdminAnalyticsPage').then(m => ({ default: m.AdminAnalyticsPage })));
const AdminDashboard = React.lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminLoginPage = React.lazy(() => import('@/pages/admin/AdminLoginPage'));
const AdminLandingPage = React.lazy(() => import('@/pages/admin/AdminLandingPage'));
const AdminLandingVideosPage = React.lazy(() => import('@/pages/admin/AdminLandingVideosPage'));
const AdminFieldsPageNew = React.lazy(() => import('@/pages/admin/AdminFieldsPageNew'));
const AdminAudiosPageNew = React.lazy(() => import('@/pages/admin/AdminAudiosPageNew'));
const AdminStatsPage = React.lazy(() => import('@/pages/admin/AdminStatsPage').then(m => ({ default: m.AdminStatsPage })));
const AdminValidationPage = React.lazy(() => import('@/pages/admin/AdminValidationPage').then(m => ({ default: m.AdminValidationPage })));
const AdminUsersPage = React.lazy(() => import('@/pages/admin/AdminUsersPage').then(m => ({ default: m.AdminUsersPage })));
const AdminCommunicationPage = React.lazy(() => import('@/pages/admin/AdminCommunicationPage'));
const AdminGuaranteePage = React.lazy(() => import('@/pages/admin/AdminGuaranteePage'));
const AdminFinancialPage = React.lazy(() => import('@/pages/admin/AdminFinancialPage'));
const AdminAnalyticsAdvancedPage = React.lazy(() => import('@/pages/admin/AdminAnalyticsAdvancedPage'));
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
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';

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
      <Route path="/assinatura/processando" element={<PaymentProcessingPage />} />
      <Route path="/assinatura/sucesso" element={<SubscriptionSuccessPage />} />
      <Route path="/pagamento" element={<PaymentPage />} />
      <Route path="/pagamento/sucesso" element={<PaymentSuccessPage />} />
      <Route path="/pagamento/cancelado" element={<PaymentCancelPage />} />
      <Route path="/onboarding/definir-senha" element={<OnboardingPage />} />
      
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
      
      {/* Rota de Recuperação de Senha */}
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      
      {/* Rota de Redefinição de Senha (PKCE idempotente) */}
      <Route path="/reset-password" element={<ResetPasswordPage />} />

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
      <Route path="/admin/login" element={
        <React.Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          </div>
        }>
          <AdminLoginPage />
        </React.Suspense>
      } />

      {/* Rotas Administrativas Protegidas */}
      <Route path="/admin" element={
        <React.Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          </div>
        }>
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        </React.Suspense>
      } />
      
      <Route path="/admin/users" element={
        <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
          <AdminProtectedRoute><AdminUsersPage /></AdminProtectedRoute>
        </React.Suspense>
      } />
      
      <Route path="/admin/communication" element={
        <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
          <AdminProtectedRoute><AdminCommunicationPage /></AdminProtectedRoute>
        </React.Suspense>
      } />
      
      <Route path="/admin/garantia" element={
        <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
          <AdminProtectedRoute><AdminGuaranteePage /></AdminProtectedRoute>
        </React.Suspense>
      } />
      
      <Route path="/admin/financial" element={
        <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
          <AdminProtectedRoute><AdminFinancialPage /></AdminProtectedRoute>
        </React.Suspense>
      } />
      
      <Route path="/admin/analytics-advanced" element={
        <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
          <AdminProtectedRoute><AdminAnalyticsAdvancedPage /></AdminProtectedRoute>
        </React.Suspense>
      } />
      
      <Route path="/admin/landing" element={
        <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
          <AdminProtectedRoute><AdminLandingPage /></AdminProtectedRoute>
        </React.Suspense>
      } />
      
      <Route path="/admin/landing-videos" element={
        <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
          <AdminProtectedRoute><AdminLandingVideosPage /></AdminProtectedRoute>
        </React.Suspense>
      } />
      
      <Route path="/admin/pricing" element={
        <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
          <AdminProtectedRoute><AdminPricingPage /></AdminProtectedRoute>
        </React.Suspense>
      } />
      
      <Route path="/admin/subscription-plans" element={
        <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
          <AdminProtectedRoute><AdminSubscriptionPlansPage /></AdminProtectedRoute>
        </React.Suspense>
      } />
      
      <Route path="/admin/fields" element={
        <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
          <AdminProtectedRoute><AdminFieldsPageNew /></AdminProtectedRoute>
        </React.Suspense>
      } />
      
      <Route path="/admin/audios" element={
        <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
          <AdminProtectedRoute><AdminAudiosPageNew /></AdminProtectedRoute>
        </React.Suspense>
      } />
      
      <Route path="/admin/background-music" element={
        <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
          <AdminProtectedRoute><AdminBackgroundMusicPage /></AdminProtectedRoute>
        </React.Suspense>
      } />
      
      <Route path="/admin/stats" element={
        <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
          <AdminProtectedRoute><AdminStatsPage /></AdminProtectedRoute>
        </React.Suspense>
      } />
      
      <Route path="/admin/analytics" element={
        <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
          <AdminProtectedRoute><AdminAnalyticsPage /></AdminProtectedRoute>
        </React.Suspense>
      } />
      
      <Route path="/admin/validation" element={
        <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
          <AdminProtectedRoute><AdminValidationPage /></AdminProtectedRoute>
        </React.Suspense>
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