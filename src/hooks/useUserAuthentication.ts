
/**
 * useUserAuthentication - Hook para gerenciar estado de autenticação de usuários
 * Responsabilidade: Conectar UI com serviço de autenticação (princípio SRP)
 * Princípio SSOT: Fonte única da verdade para estado de auth na UI
 */

import { useState } from "react";
import { UserAuthenticationService } from "@/services/userAuthenticationService";
import type { LoginCredentials } from "@/services/supabase/authService";

interface UseUserAuthenticationReturn {
  isLoading: boolean;
  error: string;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean }>;
  clearError: () => void;
}

/**
 * Hook personalizado para autenticação de usuários
 * Princípio SoC: Separa lógica de estado da lógica de negócio
 */
export const useUserAuthentication = (): UseUserAuthenticationReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean }> => {
    setIsLoading(true);
    setError("");

    try {
      const { user, error: authError } = await UserAuthenticationService.loginUser(credentials);
      
      if (authError) {
        setError(authError);
        return { success: false };
      }

      return { success: true };
    } catch (err) {
      setError("Erro interno no login.");
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
    login,
    clearError
  };
};
