
/**
 * useAdminAuthentication - Hook para gerenciar autenticação administrativa
 * Responsabilidade: Conectar UI administrativa com serviço de auth (princípio SRP)
 * Princípio SSOT: Fonte única da verdade para estado de auth admin na UI
 */

import { useState } from "react";
import { AdminAuthenticationService } from "@/services/adminAuthenticationService";
import type { LoginCredentials } from "@/services/supabase/authService";

interface UseAdminAuthenticationReturn {
  isLoading: boolean;
  error: string;
  loginAdmin: (credentials: LoginCredentials) => Promise<{ success: boolean }>;
  clearError: () => void;
}

/**
 * Hook personalizado para autenticação administrativa
 * Princípio SoC: Separa lógica de estado da lógica de negócio
 */
export const useAdminAuthentication = (): UseAdminAuthenticationReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const loginAdmin = async (credentials: LoginCredentials): Promise<{ success: boolean }> => {
    console.log('useAdminAuthentication: Iniciando processo de login administrativo');
    setIsLoading(true);
    setError("");

    try {
      const { user, error: authError } = await AdminAuthenticationService.loginAdmin(credentials);
      
      if (authError) {
        console.error('useAdminAuthentication: Erro no login:', authError);
        setError(authError);
        return { success: false };
      }

      if (!user) {
        console.error('useAdminAuthentication: Login falhou - usuário nulo');
        setError("Falha no login administrativo");
        return { success: false };
      }

      console.log('useAdminAuthentication: Login administrativo bem-sucedido');
      return { success: true };
    } catch (err) {
      console.error('useAdminAuthentication: Erro interno:', err);
      setError("Erro interno no login administrativo.");
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError("");
  };

  return {
    isLoading,
    error,
    loginAdmin,
    clearError
  };
};
