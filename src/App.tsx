
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminProvider } from "@/contexts/AdminContext";
import { UserProvider } from "@/contexts/UserContext";
import { SupabaseAuthProvider } from "@/contexts/SupabaseAuthContext";
import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import { UserProtectedRoute } from "@/components/UserProtectedRoute";
import LandingPage from "./pages/LandingPage";
import PaymentPage from "./pages/PaymentPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PaymentCancelPage from "./pages/PaymentCancelPage";
import { SubscriptionPage } from "./pages/SubscriptionPage";
import Dashboard from "./pages/Dashboard";
import FieldPage from "./pages/FieldPage";
import AudioPlayerPage from "./pages/AudioPlayerPage";
import DemoPage from "./pages/DemoPage";
import UserLoginPage from "./pages/UserLoginPage";

import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLandingPage from "./pages/admin/AdminLandingPage";
import AdminAudiosPageNew from "./pages/admin/AdminAudiosPageNew";
import AdminFieldsPageNew from "./pages/admin/AdminFieldsPageNew";
import { AdminPricingPage } from "./pages/admin/AdminPricingPage";
import { AdminStatsPage } from "./pages/admin/AdminStatsPage";
import { AdminValidationPage } from "./pages/admin/AdminValidationPage";
import { AdminAnalyticsPage } from "./pages/admin/AdminAnalyticsPage";
import { AdminBackgroundMusicPage } from "./pages/admin/AdminBackgroundMusicPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SupabaseAuthProvider>
      <AdminProvider>
        <UserProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
        <Route path="/pagamento" element={<PaymentPage />} />
        <Route path="/pagamento/sucesso" element={<PaymentSuccessPage />} />
        <Route path="/pagamento/cancelado" element={<PaymentCancelPage />} />
        <Route path="/assinatura" element={<SubscriptionPage />} />
        <Route path="/demo" element={<DemoPage />} />
              
              {/* User Routes */}
              <Route path="/login" element={<UserLoginPage />} />
              
              <Route path="/dashboard" element={
                <UserProtectedRoute>
                  <Dashboard />
                </UserProtectedRoute>
              } />
              <Route path="/campo/:fieldId" element={
                <UserProtectedRoute>
                  <FieldPage />
                </UserProtectedRoute>
              } />
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
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
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
              <Route path="/admin/audios" element={
                <AdminProtectedRoute>
                  <AdminAudiosPageNew />
                </AdminProtectedRoute>
              } />
              <Route path="/admin/fields" element={
                <AdminProtectedRoute>
                  <AdminFieldsPageNew />
                </AdminProtectedRoute>
              } />
              <Route path="/admin/stats" element={
                <AdminProtectedRoute>
                  <AdminStatsPage />
                </AdminProtectedRoute>
              } />
              <Route path="/admin/validation" element={
                <AdminProtectedRoute>
                  <AdminValidationPage />
                </AdminProtectedRoute>
              } />
              <Route path="/admin/analytics" element={
                <AdminProtectedRoute>
                  <AdminAnalyticsPage />
                </AdminProtectedRoute>
              } />
              <Route path="/admin/background-music" element={
                <AdminProtectedRoute>
                  <AdminBackgroundMusicPage />
                </AdminProtectedRoute>
              } />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
        </UserProvider>
      </AdminProvider>
    </SupabaseAuthProvider>
  </QueryClientProvider>
);

export default App;
