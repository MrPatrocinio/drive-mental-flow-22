import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import { useEffect } from "react";

interface UserProtectedRouteProps {
  children: React.ReactNode;
  requiresSubscription?: boolean;
}

/**
 * Componente responsável por proteger rotas baseado em autenticação e assinatura
 * Princípio SRP: Uma única responsabilidade - proteção de rotas
 */
export const UserProtectedRoute = ({ 
  children, 
  requiresSubscription = true // 🛡️ Seguro por padrão - assinatura obrigatória
}: UserProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useSupabaseAuth();
  const { subscribed, createSubscription, checkSubscription } = useSubscription();
  const location = useLocation();
  const navigate = useNavigate();

  // Verificar assinatura quando usuário autenticar
  useEffect(() => {
    if (isAuthenticated && requiresSubscription) {
      checkSubscription();
    }
  }, [isAuthenticated, requiresSubscription, checkSubscription]);

  // 🔒 Logs de auditoria para tentativas de acesso não autorizado
  useEffect(() => {
    if (isAuthenticated && requiresSubscription && !subscribed) {
      console.warn('[SECURITY AUDIT] Acesso negado - Assinatura necessária', {
        user_id: user?.id,
        user_email: user?.email,
        route: location.pathname,
        subscribed,
        timestamp: new Date().toISOString()
      });
    }
  }, [isAuthenticated, requiresSubscription, subscribed, user, location.pathname]);

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

  // Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Only allow regular users (not admins)
  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  // Check subscription requirement
  if (requiresSubscription && !subscribed) {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border/50">
          <CardContent className="p-6 space-y-6 text-center">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-primary/10">
                <Crown className="h-8 w-8 text-primary" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Escolha Seu Plano</h2>
              <p className="text-sm text-muted-foreground">
                Para acessar todos os áudios, escolha um dos nossos planos: trimestral, semestral ou anual.
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/assinatura')}
                className="w-full"
                size="lg"
              >
                <Crown className="h-4 w-4 mr-2" />
                Ver Planos Disponíveis
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
