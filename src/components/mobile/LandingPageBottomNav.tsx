
/**
 * LandingPageBottomNav - Menu inferior fixo para mobile
 * Responsabilidade: Apenas botão ENTRAR fixo na parte inferior (princípio SRP)
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/30 backdrop-blur-md border-t border-border/50 block md:hidden">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-center">
          <Button
            variant={isAuthenticated ? "ghost" : "premium"}
            size="lg"
            onClick={handleAuthAction}
            className={`min-w-[120px] ${
              isAuthenticated 
                ? "hover:bg-primary/10 hover:text-primary" 
                : "animate-pulse-glow"
            }`}
          >
            {isAuthenticated ? (
              <>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4 mr-2" />
                ENTRAR
              </>
            )}
          </Button>
        </div>
      </div>
    </nav>
  );
};
