import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AudioErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  showRetryButton?: boolean;
}

/**
 * Componente responsável apenas por exibir erros de áudio
 * Segue o princípio SRP: apenas UI de erro
 */
export const AudioErrorDisplay = ({ 
  error, 
  onRetry, 
  showRetryButton = true 
}: AudioErrorDisplayProps) => {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{error}</span>
        {showRetryButton && onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="ml-4"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Tentar novamente
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};