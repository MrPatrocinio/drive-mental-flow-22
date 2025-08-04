/**
 * Componente responsável por gerenciar áudios offline
 * Segue o princípio SRP: apenas UI de gerenciamento offline
 */

import { useState } from 'react';
import { Trash2, HardDrive, Download, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useOfflineAudio } from '@/hooks/useOfflineAudio';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { cn } from '@/lib/utils';

interface OfflineManagementPanelProps {
  className?: string;
}

export function OfflineManagementPanel({ className }: OfflineManagementPanelProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { isOnline } = useOfflineStatus();
  const {
    offlineAudios,
    cacheStats,
    removeAudio,
    clearCache,
    refreshData
  } = useOfflineAudio();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getStorageColor = (percentage: number): string => {
    if (percentage > 80) return 'bg-red-500';
    if (percentage > 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Gerenciar Downloads
            </CardTitle>
            <CardDescription>
              Gerencie seus áudios disponíveis offline
            </CardDescription>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Ocultar detalhes
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Ver detalhes
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Estatísticas do Cache */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Espaço utilizado</span>
            <span className="text-sm text-muted-foreground">
              {formatFileSize(cacheStats.totalSize)} / 500 MB
            </span>
          </div>
          
          <Progress 
            value={cacheStats.usedPercentage} 
            className={cn(
              'h-2',
              getStorageColor(cacheStats.usedPercentage)
            )}
          />
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {cacheStats.audioCount} áudios baixados
            </span>
            <span className="text-muted-foreground">
              {formatFileSize(cacheStats.availableSpace)} disponível
            </span>
          </div>
        </div>

        {/* Alertas */}
        {!isOnline && (
          <Alert>
            <Download className="h-4 w-4" />
            <AlertDescription>
              Você está offline. Apenas os áudios baixados estão disponíveis.
            </AlertDescription>
          </Alert>
        )}

        {cacheStats.usedPercentage > 80 && (
          <Alert variant="destructive">
            <HardDrive className="h-4 w-4" />
            <AlertDescription>
              Espaço de armazenamento quase esgotado. Considere remover alguns áudios.
            </AlertDescription>
          </Alert>
        )}

        {/* Lista de Áudios */}
        {offlineAudios.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Download className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum áudio baixado ainda</p>
            <p className="text-sm">
              Use o botão de download nos áudios para disponibilizá-los offline
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Áudios Baixados</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={clearCache}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar tudo
              </Button>
            </div>

            {offlineAudios.map((audio) => (
              <Card key={audio.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium truncate">{audio.title}</h5>
                    <div className="flex items-center gap-4 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {formatFileSize(audio.metadata.size)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Duração: {audio.metadata.duration}
                      </span>
                      {showDetails && (
                        <span className="text-xs text-muted-foreground">
                          Baixado: {formatDate(audio.downloadedAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAudio(audio.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {showDetails && (
                  <div className="mt-3 pt-3 border-t text-xs text-muted-foreground space-y-1">
                    <p>ID: {audio.id}</p>
                    <p>Campo: {audio.fieldId}</p>
                    <p>Último acesso: {formatDate(audio.lastAccessedAt)}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            className="flex-1"
          >
            Atualizar lista
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}