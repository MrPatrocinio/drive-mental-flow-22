/**
 * Sync Status Indicator Component
 * Responsabilidade: Mostrar status de sincronização
 * Princípio SRP: Apenas UI de status de sync
 */

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, RotateCcw } from "lucide-react";
import { realtimeConnection } from "@/services/realtimeConnection";
import { syncDiagnostics } from "@/services/syncDiagnostics";

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface SyncStatusIndicatorProps {
  className?: string;
}

export const SyncStatusIndicator = ({ className = "" }: SyncStatusIndicatorProps) => {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    // Verificar status inicial
    setStatus(realtimeConnection.getStatus());

    // Escutar mudanças de status
    const unsubscribe = realtimeConnection.onStatusChange((newStatus) => {
      setStatus(newStatus);
      if (newStatus === 'connected') {
        setLastSync(new Date());
      }
    });

    return unsubscribe;
  }, []);

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: Wifi,
          text: 'Conectado',
          variant: 'default' as const,
          color: 'text-green-500'
        };
      case 'connecting':
        return {
          icon: RotateCcw,
          text: 'Conectando',
          variant: 'secondary' as const,
          color: 'text-yellow-500'
        };
      case 'error':
        return {
          icon: WifiOff,
          text: 'Erro',
          variant: 'destructive' as const,
          color: 'text-red-500'
        };
      default:
        return {
          icon: WifiOff,
          text: 'Desconectado',
          variant: 'outline' as const,
          color: 'text-gray-500'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`${className} flex items-center gap-2`}>
      <Icon className={`h-3 w-3 ${config.color} ${status === 'connecting' ? 'animate-spin' : ''}`} />
      <span className="text-xs">{config.text}</span>
      {lastSync && status === 'connected' && (
        <span className="text-xs text-muted-foreground">
          {lastSync.toLocaleTimeString()}
        </span>
      )}
    </Badge>
  );
};