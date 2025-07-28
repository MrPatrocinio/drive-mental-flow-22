/**
 * Refresh Button Component - Responsável pela UI do botão de atualização
 * Responsabilidade: Apenas renderizar botão e emitir evento
 * Princípio SRP: Apenas UI do botão
 * Princípio DRY: Reutilizável em admin e usuário
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { DataSyncService } from "@/services/dataSync";
import { useToast } from "@/hooks/use-toast";

interface RefreshButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showText?: boolean;
  className?: string;
  onRefresh?: () => void | Promise<void>;
}

export const RefreshButton = ({ 
  variant = "outline", 
  size = "default",
  showText = true,
  className = "",
  onRefresh
}: RefreshButtonProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        // Simula delay de rede para UX
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Força notificação de sincronização
        DataSyncService.forceNotification('fields_changed');
        DataSyncService.forceNotification('audios_changed');
        DataSyncService.forceNotification('content_changed');
      }
      
      toast({
        title: "Atualizado",
        description: "Dados atualizados com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar dados",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleRefresh}
      disabled={isRefreshing}
      className={className}
      title="Atualizar dados"
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''} ${showText ? 'mr-2' : ''}`} />
      {showText && (isRefreshing ? "Atualizando..." : "Atualizar")}
    </Button>
  );
};