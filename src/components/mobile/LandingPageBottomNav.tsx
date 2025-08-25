
/**
 * LandingPageBottomNav - Menu inferior transparente para mobile
 * Responsabilidade: Menu transparente com botão ENTRAR discreto no canto direito (princípio SRP)
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 block md:hidden">
      {/* Menu transparente de fundo */}
      <div className="backdrop-blur-md bg-background/20 border-t border-border/30">
        {/* Container do menu */}
        <div className="container mx-auto px-4 h-16 flex items-center justify-end">
          {/* Botão Entrar/Sair discreto no canto direito - apenas ícone e texto */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAuthAction}
            className="
              flex items-center gap-2 px-3 py-2
              text-white/80 text-sm font-normal
              hover:text-white
              transition-all duration-200
              bg-transparent border-0
            "
          >
            {isAuthenticated ? (
              <>
                <LogOut className="h-4 w-4" />
                Sair
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Entrar
              </>
            )}
          </Button>
        </div>
      </div>
    </nav>
  );
};
