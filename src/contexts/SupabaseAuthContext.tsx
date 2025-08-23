
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { SupabaseAuthService, type AuthUser, type LoginCredentials, type SignUpCredentials } from "@/services/supabase/authService";
import type { Session } from "@supabase/supabase-js";

interface SupabaseAuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (credentials: LoginCredentials) => Promise<{ error: string | null }>;
  signUp: (credentials: SignUpCredentials) => Promise<{ error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | null>(null);

/**
 * Hook para usar o contexto de autenticação Supabase
 */
export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (!context) {
    throw new Error("useSupabaseAuth deve ser usado dentro de SupabaseAuthProvider");
  }
  return context;
};

interface SupabaseAuthProviderProps {
  children: ReactNode;
}

/**
 * Provider de autenticação Supabase
 * Responsabilidade: Gerenciar estado global de autenticação
 * Princípios: SSOT para estado de auth, SRP para contexto
 */
export const SupabaseAuthProvider: React.FC<SupabaseAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Configurar listener de mudanças de auth PRIMEIRO
    const { data: { subscription } } = SupabaseAuthService.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Buscar dados do perfil para completar informações do usuário
          const profile = await SupabaseAuthService.getUserProfile?.(session.user.id);
          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email!,
            display_name: profile?.display_name || session.user.email!,
            role: profile?.role || 'user'
          };
          setUser(authUser);
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    // DEPOIS verificar sessão existente
    SupabaseAuthService.getSession().then(({ session, user }) => {
      setSession(session);
      setUser(user);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (credentials: LoginCredentials) => {
    const { user: authUser, error } = await SupabaseAuthService.signIn(credentials);
    if (authUser && !error) {
      setUser(authUser);
    }
    return { error };
  };

  const signUp = async (credentials: SignUpCredentials) => {
    const { user: authUser, error } = await SupabaseAuthService.signUp(credentials);
    if (authUser && !error) {
      setUser(authUser);
    }
    return { error };
  };

  const signOut = async () => {
    const { error } = await SupabaseAuthService.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
    }
    return { error };
  };

  const value = {
    user,
    session,
    isAuthenticated: !!user && !!session,
    isLoading,
    signIn,
    signUp,
    signOut
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};
