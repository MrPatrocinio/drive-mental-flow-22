
/**
 * AdminAuthenticationService - Serviço especializado para autenticação administrativa
 * Responsabilidade: Lógica de negócio exclusiva para login de administradores
 * Princípio SRP: Apenas lógica de autenticação de admins
 * Princípio SSOT: Fonte única da verdade para auth de admins
 * Princípio KISS: Implementação simples e direta
 */

import { SupabaseAuthService, type AuthUser, type LoginCredentials } from "@/services/supabase/authService";

export interface AdminAuthResult {
  user: AuthUser | null;
  error: string | null;
}

/**
 * Serviço especializado em autenticação de administradores
 * Princípio SRP: Responsabilidade única para login administrativo
 */
export class AdminAuthenticationService {
  
  /**
   * Realiza login de administrador
   * Princípio KISS: Implementação direta sem validações desnecessárias
   * Princípio Fail Fast: Validações no início do fluxo
   */
  static async loginAdmin(credentials: LoginCredentials): Promise<AdminAuthResult> {
    console.log('AdminAuthenticationService: Iniciando login administrativo', { email: credentials.email });
    
    try {
      // Usar diretamente o SupabaseAuthService sem validações intermediárias
      const { user, error } = await SupabaseAuthService.signIn(credentials);
      
      if (error) {
        console.error('AdminAuthenticationService: Erro no login:', error);
        return { user: null, error };
      }

      if (!user) {
        console.error('AdminAuthenticationService: Usuário não encontrado');
        return { user: null, error: "Usuário não encontrado" };
      }

      // Validar se é admin APÓS login bem-sucedido
      if (user.role !== 'admin') {
        console.warn('AdminAuthenticationService: Tentativa de login de não-admin:', { 
          email: user.email, 
          role: user.role 
        });
        
        // Fazer logout se não for admin
        await SupabaseAuthService.signOut();
        return { user: null, error: "Acesso negado. Esta área é restrita a administradores." };
      }

      console.log('AdminAuthenticationService: Login administrativo bem-sucedido', { 
        email: user.email, 
        role: user.role 
      });

      return { user, error: null };
    } catch (error) {
      console.error('AdminAuthenticationService: Erro interno no login:', error);
      return { user: null, error: "Erro interno no login administrativo" };
    }
  }

  /**
   * Realiza logout de administrador
   * Princípio DRY: Reutiliza lógica do SupabaseAuthService
   */
  static async logoutAdmin(): Promise<{ error: string | null }> {
    console.log('AdminAuthenticationService: Iniciando logout administrativo');
    
    try {
      const result = await SupabaseAuthService.signOut();
      console.log('AdminAuthenticationService: Logout administrativo concluído');
      return result;
    } catch (error) {
      console.error('AdminAuthenticationService: Erro no logout:', error);
      return { error: "Erro interno no logout" };
    }
  }

  /**
   * Valida se usuário é administrador
   * Princípio SRP: Responsabilidade única de validação
   */
  static isAdmin(user: AuthUser | null): boolean {
    const isAdminUser = user !== null && user.role === 'admin';
    console.log('AdminAuthenticationService: Validação de admin:', { 
      hasUser: !!user, 
      role: user?.role, 
      isAdmin: isAdminUser 
    });
    return isAdminUser;
  }
}
