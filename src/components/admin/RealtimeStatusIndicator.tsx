import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';

export const RealtimeStatusIndicator = () => {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [updateCount, setUpdateCount] = useState(0);

  const handleUpdate = () => {
    setLastUpdate(new Date());
    setUpdateCount(prev => prev + 1);
  };

  useRealtimeUpdates({
    onFieldsChange: handleUpdate,
    onAudiosChange: handleUpdate,
    onLandingContentChange: handleUpdate
  });

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="flex items-center gap-1">
        <Wifi className="h-4 w-4 text-green-500" />
        <span className="text-muted-foreground">Real-time</span>
      </div>
      <Badge variant="secondary" className="text-xs">
        {updateCount} atualizações
      </Badge>
      {lastUpdate && (
        <span className="text-xs text-muted-foreground">
          Última: {lastUpdate.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};