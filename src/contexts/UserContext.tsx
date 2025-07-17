import { createContext, useContext, useEffect, useState } from "react";
import { UserAuthService, User, UserLoginCredentials } from "@/services/userAuthService";

export interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: UserLoginCredentials) => Promise<void>;
  logout: () => void;
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = UserAuthService.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = async (credentials: UserLoginCredentials) => {
    const loggedUser = await UserAuthService.login(credentials);
    setUser(loggedUser);
  };

  const logout = () => {
    UserAuthService.logout();
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    isLoading
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};