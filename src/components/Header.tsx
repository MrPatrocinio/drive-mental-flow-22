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
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogin}
            className="hover:bg-primary/10 hover:text-primary"
          >
            <LogIn className="h-4 w-4 mr-2" />
            Entrar
          </Button>
        </div>
      </div>
    </header>
  );
};