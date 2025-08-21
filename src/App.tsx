import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AuthLayout } from '@/components/AuthLayout';
import { SiteLayout } from '@/components/SiteLayout';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHomePage } from '@/pages/admin/AdminHomePage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { AdminFieldsPage } from '@/pages/admin/AdminFieldsPage';
import { AdminAudiosPage } from '@/pages/admin/AdminAudiosPage';
import { AdminLandingPage } from '@/pages/admin/AdminLandingPage';
import { AdminPricingPage } from '@/pages/admin/AdminPricingPage';
import { SubscriptionPage } from '@/pages/SubscriptionPage';
import { TermsOfServicePage } from '@/pages/TermsOfServicePage';
import { PrivacyPolicyPage } from '@/pages/PrivacyPolicyPage';
import { DataSyncService } from '@/services/dataSync';
import { AdminSubscriptionPlansPage } from '@/pages/admin/AdminSubscriptionPlansPage';

export function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/termos-de-servico" element={<TermsOfServicePage />} />
          <Route path="/politica-de-privacidade" element={<PrivacyPolicyPage />} />

          {/* Rotas de Autenticação */}
          <Route
            path="/login"
            element={
              <AuthLayout>
                <LoginPage />
              </AuthLayout>
            }
          />
          <Route
            path="/register"
            element={
              <AuthLayout>
                <RegisterPage />
              </AuthLayout>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <AuthLayout>
                <ForgotPasswordPage />
              </AuthLayout>
            }
          />
          <Route
            path="/reset-password"
            element={
              <AuthLayout>
                <ResetPasswordPage />
              </AuthLayout>
            }
          />

          {/* Rotas do Site (Protegidas) */}
          <Route
            path="/"
            element={
              <SiteLayout>
                <HomePage />
              </SiteLayout>
            }
          />
          <Route
            path="/perfil"
            element={
              <SiteLayout>
                <ProfilePage />
              </SiteLayout>
            }
          />
          <Route
            path="/assinatura"
            element={
              <SiteLayout>
                <SubscriptionPage />
              </SiteLayout>
            }
          />

          {/* Rotas Administrativas (Protegidas) */}
          <Route
            path="/admin"
            element={
              <AdminLayout>
                <AdminHomePage />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminLayout>
                <AdminUsersPage />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/fields"
            element={
              <AdminLayout>
                <AdminFieldsPage />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/audios"
            element={
              <AdminLayout>
                <AdminAudiosPage />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/landing-page"
            element={
              <AdminLayout>
                <AdminLandingPage />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/pricing"
            element={
              <AdminLayout>
                <AdminPricingPage />
              </AdminLayout>
            }
          />
          <Route path="/admin/subscription-plans" element={<AdminSubscriptionPlansPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    DataSyncService.init();

    if (!session && window.location.pathname !== '/login' && window.location.pathname !== '/register' && !window.location.pathname.startsWith('/reset-password') && !window.location.pathname.startsWith('/forgot-password')) {
      navigate('/login');
    }
    if (session && (window.location.pathname === '/login' || window.location.pathname === '/register' || window.location.pathname.startsWith('/reset-password') || window.location.pathname.startsWith('/forgot-password'))) {
      navigate('/');
    }
  }, [session, navigate]);

  return <>{children}</>;
}
