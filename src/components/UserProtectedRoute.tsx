import { Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { UserContext, UserContextType } from "@/contexts/UserContext";

interface UserProtectedRouteProps {
  children: React.ReactNode;
}

export const UserProtectedRoute = ({ children }: UserProtectedRouteProps) => {
  const userContext = useContext(UserContext) as UserContextType | null;
  const location = useLocation();

  // If context is not available, redirect to login
  if (!userContext) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const { isAuthenticated, isLoading } = userContext;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};