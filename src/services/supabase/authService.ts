import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { translateAuthError } from "@/services/errorTranslationService";

export interface AuthUser {
  id: string;
  email: string;
  display_name?: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials extends LoginCredentials {
  display_name?: string;
}

/**
 * Serviço de autenticação usando Supabase Auth
 * Responsabilidade: Gerenciar autenticação e sessões de usuários
 */
export class SupabaseAuthService {
  
  /**
   * Realiza login do usuário
   */
  static async signIn(credentials: LoginCredentials): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return { user: null, error: translateAuthError(error.message) };
      }

      if (!data.user) {
        return { user: null, error: "Usuário não encontrado" };
      }

      // Buscar perfil do usuário para obter informações adicionais
      const profile = await this.getUserProfile(data.user.id);
      
      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email!,
        display_name: profile?.display_name || data.user.email!,
        role: profile?.role || 'user'
      };

      return { user: authUser, error: null };
    } catch (error) {
      return { user: null, error: "Erro interno no login" };
    }
  }

  /**
   * Realiza cadastro de novo usuário
   */
  static async signUp(credentials: SignUpCredentials): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: credentials.display_name
          }
        }
      });

      if (error) {
        return { user: null, error: translateAuthError(error.message) };
      }

      if (!data.user) {
        return { user: null, error: "Erro ao criar usuário" };
      }

      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email!,
        display_name: credentials.display_name || data.user.email!,
        role: data.user.email === 'dppsoft@gmail.com' ? 'admin' : 'user'
      };

      return { user: authUser, error: null };
    } catch (error) {
      return { user: null, error: "Erro interno no cadastro" };
    }
  }

  /**
   * Realiza logout do usuário
   */
  static async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error ? translateAuthError(error.message) : null };
    } catch (error) {
      return { error: "Erro ao fazer logout" };
    }
  }

  /**
   * Obtém a sessão atual
   */
  static async getSession(): Promise<{ session: Session | null; user: AuthUser | null }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return { session: null, user: null };
      }

      const profile = await this.getUserProfile(session.user.id);
      
      const authUser: AuthUser = {
        id: session.user.id,
        email: session.user.email!,
        display_name: profile?.display_name || session.user.email!,
        role: profile?.role || 'user'
      };

      return { session, user: authUser };
    } catch (error) {
      return { session: null, user: null };
    }
  }

  /**
   * Configura listener para mudanças de estado de autenticação
   */
  static onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  }

  /**
   * Busca perfil do usuário na tabela profiles
   */
  static async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, role')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro interno ao buscar perfil:', error);
      return null;
    }
  }
}