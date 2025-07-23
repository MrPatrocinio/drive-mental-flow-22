import { Button } from "@/components/ui/button";
import { ArrowLeft, LogIn, User, LogOut, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { useContext } from "react";
import { UserContext, UserContextType } from "@/contexts/UserContext";
import { useSubscription } from "@/hooks/useSubscription";
import { NotificationBell } from "@/components/notifications/NotificationBell";

interface HeaderProps {
  showBackButton?: boolean;
  title?: string;
}

export const Header = ({ showBackButton = false, title }: HeaderProps) => {
  const navigate = useNavigate();
  
  // Safely access the UserContext without throwing an error
  const userContext = useContext(UserContext) as UserContextType | null;
  const isAuthenticated = userContext?.isAuthenticated || false;
  const user = userContext?.user || null;
  const logout = userContext?.logout || (() => {});
  const { subscribed } = useSubscription();

  const handleLogin = () => {
    navigate("/login");
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <header className="border-b border-border/50 bg-card/30 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="hover:bg-muted/50"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          {title ? (
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
          ) : (
            <Logo size="lg" />
          )}
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <NotificationBell />
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/assinatura")}
                className={`hover:bg-primary/10 hover:text-primary ${
                  subscribed ? 'border-primary text-primary' : ''
                }`}
              >
                <Crown className="h-4 w-4 mr-2" />
                {subscribed ? 'Minha Assinatura' : 'Assinar'}
              </Button>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{user?.display_name || user?.email || "Usuário"}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogin}
                className="hover:bg-primary/10 hover:text-primary"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Entrar
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};