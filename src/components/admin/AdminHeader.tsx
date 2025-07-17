import { Button } from "@/components/ui/button";
import { RefreshButton } from "@/components/RefreshButton";
import { useAdmin } from "@/contexts/AdminContext";
import { LogOut, Settings, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AdminHeaderProps {
  title?: string;
}

export const AdminHeader = ({ title = "Painel Administrativo" }: AdminHeaderProps) => {
  const { user, logout } = useAdmin();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/admin/login");
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <header className="border-b border-border/50 bg-card/30 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Settings className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
        </div>

        <div className="flex items-center gap-4">
          <RefreshButton variant="ghost" size="sm" />
          
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{user?.display_name || user?.email}</span>
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
        </div>
      </div>
    </header>
  );
};