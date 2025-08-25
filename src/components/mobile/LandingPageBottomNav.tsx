
/**
 * LandingPageBottomNav - Menu inferior fixo para mobile
 * Responsabilidade: Apenas botão ENTRAR discreto no canto direito (princípio SRP)
 * Princípio DRY: Reutiliza lógica de auth do SupabaseAuthContext
 */

import { Button } from "@/components/ui/button";
import { LogIn, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { toast } from "sonner";

export const LandingPageBottomNav = () => {
  const navigate = useNavigate();
  const { isAuthenticated, signOut, isLoading } = useSupabaseAuth();

  console.log('LandingPageBottomNav: Renderizando - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);

  const handleAuthAction = async () => {
    console.log('LandingPageBottomNav: handleAuthAction - isAuthenticated:', isAuthenticated);
    
    if (isAuthenticated) {
      // Fazer logout
      const { error } = await signOut();
      if (error) {
        toast.error("Erro ao sair: " + error);
      } else {
        toast.success("Logout realizado com sucesso!");
        navigate("/");
      }
    } else {
      // Ir para login
      navigate("/login");
    }
  };

  if (isLoading) {
    console.log('LandingPageBottomNav: Auth ainda carregando, não renderizando nav');
    return null;
  }

  return (
    <nav className="fixed bottom-4 right-4 z-50 block md:hidden">
      <Button
        variant={isAuthenticated ? "ghost" : "default"}
        size="sm"
        onClick={handleAuthAction}
        className={`
          backdrop-blur-md bg-background/80 border border-border/50 
          text-xs px-3 py-2 rounded-full shadow-lg
          ${isAuthenticated 
            ? "hover:bg-muted/80" 
            : "hover:bg-primary/90"
          }
          transition-all duration-200
        `}
      >
        {isAuthenticated ? (
          <>
            <LogOut className="h-3 w-3 mr-1" />
            Sair
          </>
        ) : (
          <>
            <LogIn className="h-3 w-3 mr-1" />
            Entrar
          </>
        )}
      </Button>
    </nav>
  );
};
