/**
 * Componente responsável por exibir botão de download offline
 * Segue o princípio SRP: apenas UI de download offline
 */

import { Download, DownloadCloud, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useOfflineAudio } from '@/hooks/useOfflineAudio';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { cn } from '@/lib/utils';

interface OfflineDownloadButtonProps {
  audioId: string;
  audioUrl: string;
  audioTitle: string;
  fieldId: string;
  duration: string;
  size?: 'sm' | 'lg' | 'default';
  variant?: 'default' | 'outline' | 'ghost';
  showProgress?: boolean;
  className?: string;
}

export function OfflineDownloadButton({
  audioId,
  audioUrl,
  audioTitle,
  fieldId,
  duration,
  size = 'default',
  variant = 'outline',
  showProgress = true,
  className
}: OfflineDownloadButtonProps) {
  const { isOnline } = useOfflineStatus();
  const {
    isAvailableOffline,
    isDownloading,
    downloadProgress,
    downloadAudio,
    removeAudio
  } = useOfflineAudio(audioId);

  const handleDownload = async () => {
    if (!isOnline) return;

    await downloadAudio(audioId, audioUrl, {
      title: audioTitle,
      fieldId,
      duration
    });
  };

  const handleRemove = async () => {
    await removeAudio(audioId);
  };

  const getIcon = () => {
    if (isAvailableOffline) return Check;
    if (isDownloading) return DownloadCloud;
    return Download;
  };

  const getButtonText = () => {
    if (isAvailableOffline) return 'Baixado';
    if (isDownloading) return 'Baixando...';
    if (!isOnline) return 'Sem conexão';
    return 'Baixar';
  };

  const getButtonVariant = (): 'default' | 'outline' | 'ghost' => {
    return 'ghost';
  };

  const Icon = getIcon();

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Button
        variant={getButtonVariant()}
        size={size}
        onClick={isAvailableOffline ? undefined : handleDownload}
        disabled={isDownloading || !isOnline}
        className={cn(
          'w-8 h-8 p-0',
          isAvailableOffline && 'text-green-600 hover:text-green-700'
        )}
      >
        <Icon className={cn(
          'h-4 w-4',
          isDownloading && 'animate-pulse'
        )} />
        <span className="sr-only">
          {getButtonText()}
        </span>
      </Button>

      {showProgress && isDownloading && (
        <div className="w-full">
          <Progress 
            value={downloadProgress} 
            className="h-2"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {downloadProgress}% baixado
          </p>
        </div>
      )}

      {!isOnline && (
        <p className="text-xs text-orange-500">
          Conecte-se à internet para baixar
        </p>
      )}
    </div>
  );
}