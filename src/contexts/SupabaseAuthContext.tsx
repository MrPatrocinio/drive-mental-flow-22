import * as React from "react";
import { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from "react";
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
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // Primeiro, verificar sessão existente
        const { session, user } = await SupabaseAuthService.getSession();
        
        if (!isMounted) return;
        
        console.log('Initial session check:', session?.user?.id);
        setSession(session);
        setUser(user);
        
        // Configurar listener APÓS verificação inicial
        const { data: { subscription } } = SupabaseAuthService.onAuthStateChange(
          async (event, session) => {
            if (!isMounted) return;

            console.log('Auth state changed:', event, session?.user?.id);
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
          }
        );

        // Cleanup subscription when component unmounts
        return () => {
          subscription.unsubscribe();
        };
        
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const cleanup = initializeAuth();

    return () => {
      isMounted = false;
      cleanup?.then?.(cleanupFn => cleanupFn?.());
    };
  }, []);

  const signIn = useCallback(async (credentials: LoginCredentials) => {
    const { user: authUser, error } = await SupabaseAuthService.signIn(credentials);
    if (authUser && !error) {
      setUser(authUser);
    }
    return { error };
  }, []);

  const signUp = useCallback(async (credentials: SignUpCredentials) => {
    const { user: authUser, error } = await SupabaseAuthService.signUp(credentials);
    if (authUser && !error) {
      setUser(authUser);
    }
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await SupabaseAuthService.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
    }
    return { error };
  }, []);

  const value = useMemo(() => ({
    user,
    session,
    isAuthenticated: !!user && !!session,
    isLoading,
    signIn,
    signUp,
    signOut
  }), [user, session, isLoading, signIn, signUp, signOut]);

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};
