
import React from 'react';
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AudioErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  onValidateUrl?: () => void;
  showRetryButton?: boolean;
  showValidateButton?: boolean;
}

/**
 * Componente responsável apenas por exibir erros de áudio
 * Segue o princípio SRP: apenas UI de erro
 * MELHORADO: Mais opções de recuperação
 */
export const AudioErrorDisplay = ({ 
  error, 
  onRetry, 
  onValidateUrl,
  showRetryButton = true,
  showValidateButton = false
}: AudioErrorDisplayProps) => {
  const isNetworkError = error.toLowerCase().includes('rede') || 
                         error.toLowerCase().includes('conexão') ||
                         error.toLowerCase().includes('timeout');

  return (
    <Alert variant="destructive" className="my-4">
      {isNetworkError ? <WifiOff className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
      <AlertDescription>
        <div className="flex flex-col gap-3">
          <span>{error}</span>
          
          {isNetworkError && (
            <div className="text-sm text-muted-foreground">
              • Verifique sua conexão com a internet<br />
              • Tente desativar VPN ou proxy<br />
              • Aguarde alguns segundos e tente novamente
            </div>
          )}
          
          <div className="flex gap-2">
            {showRetryButton && onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Tentar novamente
              </Button>
            )}
            
            {showValidateButton && onValidateUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={onValidateUrl}
              >
                <Wifi className="h-3 w-3 mr-1" />
                Validar áudio
              </Button>
            )}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};
