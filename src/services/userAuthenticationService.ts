
/**
 * UserAuthenticationService - Serviço para gerenciar autenticação de usuários regulares
 * Responsabilidade: Lógica de negócio para autenticação de usuários (não admins)
 * Princípio SRP: Apenas lógica de autenticação de usuários regulares
 * Princípio DRY: Centraliza lógica de auth evitando duplicação
 */

import { SupabaseAuthService, type AuthUser, type LoginCredentials } from "@/services/supabase/authService";

export interface UserAuthResult {
  user: AuthUser | null;
  error: string | null;
}

/**
 * Serviço especializado em autenticação de usuários regulares
 * Separa a lógica de negócio da UI seguindo princípios de arquitetura limpa
 */
export class UserAuthenticationService {
  
  /**
   * Realiza login de usuário regular (não admin)
   * Princípio KISS: Implementação simples e direta
   */
  static async loginUser(credentials: LoginCredentials): Promise<UserAuthResult> {
    try {
      const { user, error } = await SupabaseAuthService.signIn(credentials);
      
      if (error) {
        return { user: null, error };
      }

      if (!user) {
        return { user: null, error: "Usuário não encontrado" };
      }

      // Validar que não é admin (princípio de validação fail-fast)
      if (user.role === 'admin') {
        await SupabaseAuthService.signOut();
        return { user: null, error: "Use o login administrativo para contas de admin" };
      }

      return { user, error: null };
    } catch (error) {
      return { user: null, error: "Erro interno no login" };
    }
  }

  /**
   * Realiza logout de usuário
   * Princípio SSOT: Centraliza lógica de logout
   */
  static async logoutUser(): Promise<{ error: string | null }> {
    try {
      return await SupabaseAuthService.signOut();
    } catch (error) {
      return { error: "Erro interno no logout" };
    }
  }

  /**
   * Valida se usuário é regular (não admin)
   * Princípio SRP: Responsabilidade única de validação
   */
  static isRegularUser(user: AuthUser | null): boolean {
    return user !== null && user.role === 'user';
  }
}
