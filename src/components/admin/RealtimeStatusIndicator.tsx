import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';
import { useDataSync } from '@/hooks/useDataSync';
import { realtimeConnection } from '@/services/realtimeConnection';

export const RealtimeStatusIndicator = () => {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [updateCount, setUpdateCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');

  const handleUpdate = () => {
    setLastUpdate(new Date());
    setUpdateCount(prev => prev + 1);
  };

  useDataSync({
    onFieldsChange: handleUpdate,
    onAudiosChange: handleUpdate,
    onContentChange: handleUpdate
  });

  useEffect(() => {
    const unsubscribe = realtimeConnection.onStatusChange(setConnectionStatus);
    return unsubscribe;
  }, []);

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'connecting':
        return <Wifi className="h-4 w-4 text-yellow-500 animate-pulse" />;
      case 'error':
        return <WifiOff className="h-4 w-4 text-red-500" />;
      default:
        return <WifiOff className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Conectado';
      case 'connecting':
        return 'Conectando...';
      case 'error':
        return 'Erro de conexão';
      default:
        return 'Desconectado';
    }
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="flex items-center gap-1">
        {getStatusIcon()}
        <span className="text-muted-foreground">{getStatusText()}</span>
      </div>
      <Badge variant="secondary" className="text-xs">
        {updateCount} sync
      </Badge>
      {lastUpdate && (
        <span className="text-xs text-muted-foreground">
          {lastUpdate.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};