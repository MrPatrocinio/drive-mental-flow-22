
/**
 * PWA Status Badge Component - Mostra status de instalação PWA
 * Responsabilidade: Apenas exibir status PWA
 * Princípio SRP: Apenas UI de status PWA
 */

import { Smartphone, Download, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePWA } from "@/hooks/usePWA";

interface PWAStatusBadgeProps {
  variant?: "badge" | "button";
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export const PWAStatusBadge = ({ 
  variant = "badge", 
  size = "md", 
  showText = true 
}: PWAStatusBadgeProps) => {
  const { isInstalled, isInstallable, installApp, isInstalling, platform } = usePWA();

  if (isInstalled) {
    if (variant === "badge") {
      return (
        <Badge variant="secondary" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          {showText && "App Instalado"}
        </Badge>
      );
    }
    return null;
  }

  if (!isInstallable) {
    return null;
  }

  if (variant === "button") {
    return (
      <Button
        variant="outline"
        size={size}
        onClick={installApp}
        disabled={isInstalling || platform === 'ios'}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        {showText && (isInstalling ? "Instalando..." : "Instalar App")}
      </Button>
    );
  }

  return (
    <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-primary/10">
      <Smartphone className="h-3 w-3" />
      {showText && "Instalável"}
    </Badge>
  );
};
