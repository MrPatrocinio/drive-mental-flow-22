/**
 * Hook PWA Boot - Gerencia redirecionamento inicial em standalone
 * Responsabilidade: Detectar PWA e redirecionar usuários logados
 * Princípio SRP: Apenas lógica de boot PWA
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { PWAPreferencesService } from '@/services/pwaPreferencesService';

interface PWABootState {
  isChecking: boolean;
  shouldShowContent: boolean;
}

export function usePWABoot(): PWABootState {
  const [isChecking, setIsChecking] = useState(true);
  const [shouldShowContent, setShouldShowContent] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading: authLoading, session } = useSupabaseAuth();

  useEffect(() => {
    // Salvar rota atual se não for pública
    if (location.pathname && !['/', '/landing', '/home'].includes(location.pathname)) {
      PWAPreferencesService.setLastRoute(location.pathname + location.search);
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    const checkPWABoot = async () => {
      // Aguardar auth context carregar
      if (authLoading) {
        return;
      }

      // Detectar se está em modo PWA
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches || 
                          (navigator as any).standalone === true;

      const isPublicRoute = ['/', '/landing', '/home'].includes(location.pathname);

      // Se PWA + autenticado + rota pública = redirecionar
      if (isStandalone && isAuthenticated && session && isPublicRoute) {
        const lastRoute = PWAPreferencesService.getLastRoute();
        const targetRoute = lastRoute || '/dashboard';
        
        console.log('PWA Boot: Redirecionando usuário logado de', location.pathname, 'para', targetRoute);
        navigate(targetRoute, { replace: true });
        return;
      }

      // Liberar renderização
      setIsChecking(false);
      setShouldShowContent(true);
    };

    checkPWABoot();
  }, [authLoading, isAuthenticated, session, location.pathname, navigate]);

  return {
    isChecking: authLoading || isChecking,
    shouldShowContent
  };
}