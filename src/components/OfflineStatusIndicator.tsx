/**
 * Componente responsável por exibir status de conectividade
 * Segue o princípio SRP: apenas UI de status de conectividade
 */

import { Wifi, WifiOff, Signal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { cn } from '@/lib/utils';

interface OfflineStatusIndicatorProps {
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function OfflineStatusIndicator({
  showText = true,
  size = 'md',
  className
}: OfflineStatusIndicatorProps) {
  const { isOnline, connectionStatus, effectiveType } = useOfflineStatus();

  const getIcon = () => {
    if (!isOnline) return WifiOff;
    if (connectionStatus === 'slow') return Signal;
    return Wifi;
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (connectionStatus === 'slow') return 'Conexão lenta';
    return 'Online';
  };

  const getStatusColor = () => {
    if (!isOnline) return 'destructive';
    if (connectionStatus === 'slow') return 'secondary';
    return 'default';
  };

  const getConnectionDetails = () => {
    if (!isOnline) return null;
    if (effectiveType) {
      return effectiveType.toUpperCase();
    }
    return null;
  };

  const Icon = getIcon();
  const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Badge 
        variant={getStatusColor()}
        className={cn(
          'flex items-center gap-1',
          size === 'sm' && 'text-xs px-2 py-1',
          size === 'lg' && 'text-base px-3 py-2'
        )}
      >
        <Icon className={cn(
          iconSize,
          !isOnline && 'text-destructive-foreground',
          connectionStatus === 'slow' && 'text-yellow-600'
        )} />
        
        {showText && (
          <span className="font-medium">
            {getStatusText()}
          </span>
        )}
        
        {getConnectionDetails() && (
          <span className="text-xs opacity-75 ml-1">
            {getConnectionDetails()}
          </span>
        )}
      </Badge>

      {!isOnline && (
        <span className="text-xs text-muted-foreground hidden sm:inline">
          Alguns recursos podem estar limitados
        </span>
      )}
    </div>
  );
}