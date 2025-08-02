import { Button } from "@/components/ui/button";
import { ArrowLeft, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";

interface HeaderProps {
  showBackButton?: boolean;
  title?: string;
}

export const Header = ({ showBackButton = false, title }: HeaderProps) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <header className="border-b border-border/50 bg-card/30 backdrop-blur-md sticky top-0 z-50 w-full">
      <div className="container mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="hover:bg-muted/50 shrink-0"
            >
              <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          )}
          {title ? (
            <h1 className="text-lg md:text-xl font-bold text-foreground truncate">{title}</h1>
          ) : (
            <Logo size="lg" />
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogin}
            className="hover:bg-primary/10 hover:text-primary text-xs md:text-sm"
          >
            <LogIn className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Entrar</span>
            <span className="sm:hidden">Login</span>
          </Button>
        </div>
      </div>
    </header>
  );
};