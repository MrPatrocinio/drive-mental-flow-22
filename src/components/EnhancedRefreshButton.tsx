/**
 * Enhanced Refresh Button Component
 * Responsabilidade: Botão avançado de atualização com fallback
 * Princípio SRP: Apenas UI e controle de refresh
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { syncFallback } from "@/services/syncFallback";
import { syncDiagnostics } from "@/services/syncDiagnostics";

interface EnhancedRefreshButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showText?: boolean;
  className?: string;
  onRefresh: () => Promise<void>;
  enableFallback?: boolean;
  fallbackIntervalMs?: number;
}

export const EnhancedRefreshButton = ({ 
  variant = "outline", 
  size = "default",
  showText = true,
  className = "",
  onRefresh,
  enableFallback = false,
  fallbackIntervalMs = 30000
}: EnhancedRefreshButtonProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { toast } = useToast();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setHasError(false);
    
    try {
      await syncFallback.forceRefresh(onRefresh);
      
      toast({
        title: "Atualizado",
        description: "Dados sincronizados com sucesso"
      });

      // Iniciar fallback se habilitado
      if (enableFallback && !syncFallback.isRunning()) {
        syncFallback.startPolling({
          intervalMs: fallbackIntervalMs,
          maxRetries: 5,
          onRefresh
        });
      }
    } catch (error) {
      setHasError(true);
      syncDiagnostics.log('manual_refresh_error', 'error', error);
      
      toast({
        title: "Erro na Sincronização",
        description: "Falha ao atualizar dados. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const displayVariant = hasError ? "destructive" : variant;
  const icon = hasError ? AlertCircle : RefreshCw;
  const IconComponent = icon;

  return (
    <Button
      variant={displayVariant}
      size={size}
      onClick={handleRefresh}
      disabled={isRefreshing}
      className={className}
      title={hasError ? "Erro na sincronização - Clique para tentar novamente" : "Atualizar dados"}
    >
      <IconComponent className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''} ${showText ? 'mr-2' : ''}`} />
      {showText && (
        <>
          {isRefreshing ? "Atualizando..." : hasError ? "Tentar Novamente" : "Atualizar"}
        </>
      )}
    </Button>
  );
};