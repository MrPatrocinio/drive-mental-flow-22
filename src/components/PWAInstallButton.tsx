/**
 * PWA Install Button - Botão compacto para instalação PWA
 * Responsabilidade: Apenas UI do botão de instalação
 * Princípio SRP: Apenas botão de instalação PWA
 */

import { useState } from "react";
import { Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWA } from "@/hooks/usePWA";
import { PWAInstallModal } from "./PWAInstallModal";

interface PWAInstallButtonProps {
  variant?: "ghost" | "outline" | "default";
  size?: "sm" | "default" | "lg";
  className?: string;
}

export const PWAInstallButton = ({ 
  variant = "ghost", 
  size = "sm", 
  className = "" 
}: PWAInstallButtonProps) => {
  const { 
    isInstalled, 
    isInstallable, 
    isDismissedByUser,
    platform,
    installApp, 
    isInstalling 
  } = usePWA();
  
  const [showModal, setShowModal] = useState(false);

  // Não mostrar se já instalado, não instalável ou foi descartado
  if (isInstalled || !isInstallable || isDismissedByUser) {
    return null;
  }

  const handleClick = async () => {
    if (platform === 'android' || platform === 'desktop') {
      // Para Android/Desktop: tenta prompt nativo
      const success = await installApp();
      if (!success) {
        // Se falhou, mostra modal
        setShowModal(true);
      }
    } else {
      // Para iOS e outros: sempre mostra modal
      setShowModal(true);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        disabled={isInstalling}
        className={`gap-2 ${className}`}
        title="Instalar Drive Mental como app"
      >
        {isInstalling ? (
          <Download className="h-4 w-4 animate-spin" />
        ) : (
          <Smartphone className="h-4 w-4" />
        )}
        {size !== "sm" && (
          <span>{isInstalling ? "Instalando..." : "Instalar App"}</span>
        )}
      </Button>

      <PWAInstallModal 
        open={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};