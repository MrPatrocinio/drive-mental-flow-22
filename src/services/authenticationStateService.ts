/**
 * AuthenticationStateService - Serviço para gerenciar estado de autenticação
 * Responsabilidade: SSOT para estado de autenticação da aplicação
 * Princípio SRP: Apenas lógica de estado de autenticação
 * Princípio SSOT: Fonte única da verdade para autenticação
 */

import { SupabaseAuthService, type AuthUser } from "@/services/supabase/authService";
import type { Session } from "@supabase/supabase-js";

export interface AuthenticationState {
  user: AuthUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type AuthStateChangeCallback = (state: AuthenticationState) => void;

/**
 * Serviço singleton para gerenciar estado global de autenticação
 */
export class AuthenticationStateService {
  private static instance: AuthenticationStateService;
  private state: AuthenticationState = {
    user: null,
    session: null,
    isAuthenticated: false,
    isLoading: true
  };
  private subscribers: Set<AuthStateChangeCallback> = new Set();
  private initialized = false;

  private constructor() {}

  static getInstance(): AuthenticationStateService {
    if (!this.instance) {
      this.instance = new AuthenticationStateService();
    }
    return this.instance;
  }

  /**
   * Inicializa o serviço de estado de autenticação
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Configurar listener de mudanças de auth PRIMEIRO
    SupabaseAuthService.onAuthStateChange(async (event, session) => {
      await this.handleAuthStateChange(session);
    });

    // DEPOIS verificar sessão existente
    const { session, user } = await SupabaseAuthService.getSession();
    this.updateState({
      user,
      session,
      isAuthenticated: !!user && !!session,
      isLoading: false
    });

    this.initialized = true;
  }

  /**
   * Manipula mudanças de estado de autenticação
   */
  private async handleAuthStateChange(session: Session | null): Promise<void> {
    let user: AuthUser | null = null;

    if (session?.user) {
      // Buscar dados do perfil para completar informações do usuário
      const profile = await SupabaseAuthService.getUserProfile(session.user.id);
      user = {
        id: session.user.id,
        email: session.user.email!,
        display_name: profile?.display_name || session.user.email!,
        role: profile?.role || 'user'
      };
    }

    this.updateState({
      user,
      session,
      isAuthenticated: !!user && !!session,
      isLoading: false
    });
  }

  /**
   * Atualiza o estado e notifica subscribers
   */
  private updateState(newState: Partial<AuthenticationState>): void {
    this.state = { ...this.state, ...newState };
    this.notifySubscribers();
  }

  /**
   * Notifica todos os subscribers sobre mudanças de estado
   */
  private notifySubscribers(): void {
    this.subscribers.forEach(callback => {
      try {
        callback(this.state);
      } catch (error) {
        console.error('Erro ao notificar subscriber de auth:', error);
      }
    });
  }

  /**
   * Subscreve para receber notificações de mudanças de estado
   */
  subscribe(callback: AuthStateChangeCallback): () => void {
    this.subscribers.add(callback);
    
    // Retorna função para cancelar subscription
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Obtém o estado atual de autenticação
   */
  getState(): AuthenticationState {
    return { ...this.state };
  }

  /**
   * Verifica se o usuário está autenticado
   */
  isUserAuthenticated(): boolean {
    return this.state.isAuthenticated;
  }

  /**
   * Obtém o usuário atual
   */
  getCurrentUser(): AuthUser | null {
    return this.state.user;
  }

  /**
   * Obtém a sessão atual
   */
  getCurrentSession(): Session | null {
    return this.state.session;
  }

  /**
   * Limpa o estado de autenticação (usado no logout)
   */
  clearAuthState(): void {
    this.updateState({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false
    });
  }
}

// Export singleton instance
export const authStateService = AuthenticationStateService.getInstance();