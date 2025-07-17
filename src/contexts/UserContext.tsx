import { createContext, useContext } from "react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import type { AuthUser, LoginCredentials } from "@/services/supabase/authService";

export interface UserContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<{ error: string | null }>;
  logout: () => Promise<{ error: string | null }>;
  isLoading: boolean;
}

export const UserContext = createContext<UserContextType | null>(null);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, isLoading, signIn, signOut } = useSupabaseAuth();

  const login = async (credentials: LoginCredentials) => {
    return await signIn(credentials);
  };

  const logout = async () => {
    return await signOut();
  };

  const value: UserContextType = {
    user,
    isAuthenticated: isAuthenticated && user?.role === 'user',
    login,
    logout,
    isLoading
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};