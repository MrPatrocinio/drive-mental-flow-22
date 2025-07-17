import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface SupabaseProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "user";
}

/**
 * Componente de proteção de rotas para Supabase Auth
 * Responsabilidade: Controlar acesso baseado em autenticação e role
 * Princípios: SRP para proteção, KISS para lógica simples
 */
export const SupabaseProtectedRoute = ({ 
  children, 
  requiredRole = "user" 
}: SupabaseProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useSupabaseAuth();
  const location = useLocation();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border/50">
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <Skeleton className="w-16 h-16 rounded-full" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Não autenticado
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Verificação de role (se necessário)
  if (requiredRole === "admin" && user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};