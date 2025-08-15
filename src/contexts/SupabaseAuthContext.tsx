
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
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
export const SupabaseAuthProvider = ({ children }: SupabaseAuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  console.log('SupabaseAuthProvider: Estado atual', { 
    user: !!user, 
    session: !!session, 
    isLoading, 
    userId: user?.id 
  });

  useEffect(() => {
    console.log('SupabaseAuthProvider: Inicializando contexto de auth');
    
    // Timeout para evitar loading infinito de auth
    const authTimeout = setTimeout(() => {
      console.warn('SupabaseAuthProvider: Timeout no carregamento de auth, definindo loading como false');
      setIsLoading(false);
    }, 8000); // 8 segundos de timeout

    // Configurar listener de mudanças de auth PRIMEIRO
    console.log('SupabaseAuthProvider: Configurando listener de auth state');
    const { data: { subscription } } = SupabaseAuthService.onAuthStateChange(
      async (event, session) => {
        console.log('SupabaseAuthProvider: Auth state change', { event, hasSession: !!session });
        
        clearTimeout(authTimeout);
        setSession(session);
        
        if (session?.user) {
          console.log('SupabaseAuthProvider: Sessão encontrada, buscando perfil do usuário');
          // Buscar dados do perfil para completar informações do usuário
          const profile = await SupabaseAuthService.getUserProfile?.(session.user.id);
          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email!,
            display_name: profile?.display_name || session.user.email!,
            role: profile?.role || 'user'
          };
          console.log('SupabaseAuthProvider: Usuário autenticado', { userId: authUser.id, role: authUser.role });
          setUser(authUser);
        } else {
          console.log('SupabaseAuthProvider: Nenhuma sessão, usuário deslogado');
          setUser(null);
        }
        
        setIsLoading(false);
        console.log('SupabaseAuthProvider: Loading de auth definido como false');
      }
    );

    // DEPOIS verificar sessão existente
    console.log('SupabaseAuthProvider: Verificando sessão existente');
    SupabaseAuthService.getSession().then(({ session, user }) => {
      console.log('SupabaseAuthProvider: Sessão existente verificada', { 
        hasSession: !!session, 
        hasUser: !!user 
      });
      
      clearTimeout(authTimeout);
      setSession(session);
      setUser(user);
      setIsLoading(false);
      console.log('SupabaseAuthProvider: Estado inicial definido, loading como false');
    }).catch(error => {
      console.error('SupabaseAuthProvider: Erro ao verificar sessão existente:', error);
      clearTimeout(authTimeout);
      setIsLoading(false);
    });

    return () => {
      console.log('SupabaseAuthProvider: Limpando subscription de auth');
      clearTimeout(authTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (credentials: LoginCredentials) => {
    console.log('SupabaseAuthProvider: Tentativa de login');
    const { user: authUser, error } = await SupabaseAuthService.signIn(credentials);
    if (authUser && !error) {
      console.log('SupabaseAuthProvider: Login bem-sucedido');
      setUser(authUser);
    } else {
      console.error('SupabaseAuthProvider: Erro no login:', error);
    }
    return { error };
  };

  const signUp = async (credentials: SignUpCredentials) => {
    console.log('SupabaseAuthProvider: Tentativa de cadastro');
    const { user: authUser, error } = await SupabaseAuthService.signUp(credentials);
    if (authUser && !error) {
      console.log('SupabaseAuthProvider: Cadastro bem-sucedido');
      setUser(authUser);
    } else {
      console.error('SupabaseAuthProvider: Erro no cadastro:', error);
    }
    return { error };
  };

  const signOut = async () => {
    console.log('SupabaseAuthProvider: Tentativa de logout');
    const { error } = await SupabaseAuthService.signOut();
    if (!error) {
      console.log('SupabaseAuthProvider: Logout bem-sucedido');
      setUser(null);
      setSession(null);
    } else {
      console.error('SupabaseAuthProvider: Erro no logout:', error);
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

  console.log('SupabaseAuthProvider: Renderizando provider com valor', {
    hasUser: !!value.user,
    hasSession: !!value.session,
    isAuthenticated: value.isAuthenticated,
    isLoading: value.isLoading
  });

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};
