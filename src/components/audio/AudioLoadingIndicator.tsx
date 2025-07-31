import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Componente responsável apenas por exibir estado de carregamento
 * Segue o princípio SRP: apenas UI de loading
 */
export const AudioLoadingIndicator = () => {
  return (
    <div className="flex items-center justify-center py-4">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <span className="ml-2 text-sm text-muted-foreground">
        Carregando áudio...
      </span>
    </div>
  );
};