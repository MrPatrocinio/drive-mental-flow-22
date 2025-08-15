
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider } from "next-themes";
import { AudioPlaybackProvider } from "@/contexts/AudioPlaybackContext";
import { UserProvider } from "@/contexts/UserContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { SupabaseAuthProvider } from "@/contexts/SupabaseAuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Import pages
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import FieldPage from "./pages/FieldPage";
import AudioPlayerPage from "./pages/AudioPlayerPage";
import DemoPage from "./pages/DemoPage";
import PaymentPage from "./pages/PaymentPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PaymentCancelPage from "./pages/PaymentCancelPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import UserLoginPage from "./pages/UserLoginPage";
import OfflineManagementPage from "./pages/OfflineManagementPage";
import NotFound from "./pages/NotFound";

// Import admin pages
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLandingPage from "./pages/admin/AdminLandingPage";
import AdminAudiosPageNew from "./pages/admin/AdminAudiosPageNew";
import AdminFieldsPageNew from "./pages/admin/AdminFieldsPageNew";
import AdminPricingPage from "./pages/admin/AdminPricingPage";
import AdminBackgroundMusicPage from "./pages/admin/AdminBackgroundMusicPage";
import AdminStatsPage from "./pages/admin/AdminStatsPage";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";
import AdminValidationPage from "./pages/admin/AdminValidationPage";

// Import protected route components
import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import { SupabaseProtectedRoute } from "@/components/SupabaseProtectedRoute";
import { UserProtectedRoute } from "@/components/UserProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => {
  console.log('App: Inicializando aplicação principal');
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <NextUIProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider>
              <SupabaseAuthProvider>
                <UserProvider>
                  <AdminProvider>
                    <AudioPlaybackProvider>
                      <BrowserRouter>
                        <Routes>
                          {/* Public Routes */}
                          <Route path="/" element={<LandingPage />} />
                          <Route path="/demo" element={<DemoPage />} />
                          <Route path="/login" element={<UserLoginPage />} />
                          <Route path="/subscription" element={<SubscriptionPage />} />
                          <Route path="/payment" element={<PaymentPage />} />
                          <Route path="/payment/success" element={<PaymentSuccessPage />} />
                          <Route path="/payment/cancel" element={<PaymentCancelPage />} />

                          {/* User Protected Routes */}
                          <Route
                            path="/dashboard"
                            element={
                              <UserProtectedRoute>
                                <Dashboard />
                              </UserProtectedRoute>
                            }
                          />
                          <Route
                            path="/campo/:fieldId"
                            element={
                              <UserProtectedRoute>
                                <FieldPage />
                              </UserProtectedRoute>
                            }
                          />
                          <Route
                            path="/audio/:audioId"
                            element={
                              <UserProtectedRoute>
                                <AudioPlayerPage />
                              </UserProtectedRoute>
                            }
                          />
                          <Route
                            path="/offline"
                            element={
                              <UserProtectedRoute>
                                <OfflineManagementPage />
                              </UserProtectedRoute>
                            }
                          />

                          {/* Admin Routes */}
                          <Route path="/admin/login" element={<AdminLoginPage />} />
                          <Route
                            path="/admin"
                            element={
                              <AdminProtectedRoute>
                                <AdminDashboard />
                              </AdminProtectedRoute>
                            }
                          />
                          <Route
                            path="/admin/landing"
                            element={
                              <AdminProtectedRoute>
                                <AdminLandingPage />
                              </AdminProtectedRoute>
                            }
                          />
                          <Route
                            path="/admin/audios"
                            element={
                              <AdminProtectedRoute>
                                <AdminAudiosPageNew />
                              </AdminProtectedRoute>
                            }
                          />
                          <Route
                            path="/admin/fields"
                            element={
                              <AdminProtectedRoute>
                                <AdminFieldsPageNew />
                              </AdminProtectedRoute>
                            }
                          />
                          <Route
                            path="/admin/pricing"
                            element={
                              <AdminProtectedRoute>
                                <AdminPricingPage />
                              </AdminProtectedRoute>
                            }
                          />
                          <Route
                            path="/admin/background-music"
                            element={
                              <AdminProtectedRoute>
                                <AdminBackgroundMusicPage />
                              </AdminProtectedRoute>
                            }
                          />
                          <Route
                            path="/admin/stats"
                            element={
                              <AdminProtectedRoute>
                                <AdminStatsPage />
                              </AdminProtectedRoute>
                            }
                          />
                          <Route
                            path="/admin/analytics"
                            element={
                              <AdminProtectedRoute>
                                <AdminAnalyticsPage />
                              </AdminProtectedRoute>
                            }
                          />
                          <Route
                            path="/admin/validation"
                            element={
                              <AdminProtectedRoute>
                                <AdminValidationPage />
                              </AdminProtectedRoute>
                            }
                          />

                          {/* 404 */}
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </BrowserRouter>
                      <Toaster />
                      <Sonner />
                    </AudioPlaybackProvider>
                  </AdminProvider>
                </UserProvider>
              </SupabaseAuthProvider>
            </TooltipProvider>
          </ThemeProvider>
        </NextUIProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
