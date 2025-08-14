
/**
 * Componente para exibir status de sincronização de preços
 * Responsabilidade: UI para monitoramento de sincronização
 * Princípios: SRP (uma responsabilidade), KISS (interface simples)
 */

import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, RefreshCw, Zap } from 'lucide-react';
import { usePricingSync } from '@/hooks/usePricingSync';
import { PricingInfo } from '@/services/supabase/pricingService';

interface PricingSyncStatusProps {
  pricing: PricingInfo | null;
  onSync?: (success: boolean) => void;
}

export const PricingSyncStatus: React.FC<PricingSyncStatusProps> = ({ 
  pricing, 
  onSync 
}) => {
  const {
    isLoading,
    lastSync,
    syncStatus,
    syncPricing,
    checkSyncStatus,
    getStripeData,
    formatAmount
  } = usePricingSync();

  // Verificar status ao montar componente
  useEffect(() => {
    checkSyncStatus();
  }, [checkSyncStatus]);

  const handleSync = async () => {
    if (!pricing) return;

    const result = await syncPricing(pricing);
    onSync?.(!!result);
  };

  const stripeData = pricing ? getStripeData(pricing) : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Status de Sincronização
        </CardTitle>
        <Badge variant={syncStatus.isSynced ? "default" : "destructive"}>
          {syncStatus.isSynced ? (
            <CheckCircle className="h-3 w-3 mr-1" />
          ) : (
            <AlertCircle className="h-3 w-3 mr-1" />
          )}
          {syncStatus.isSynced ? 'Sincronizado' : 'Fora de Sincronia'}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Informações de Sincronização */}
        {stripeData && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-muted-foreground">Valor Stripe:</p>
              <p className="font-mono">{formatAmount(stripeData.amount)}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Moeda:</p>
              <p className="font-mono uppercase">{stripeData.currency}</p>
            </div>
            <div className="col-span-2">
              <p className="font-medium text-muted-foreground">Produto:</p>
              <p className="text-sm">{stripeData.productName}</p>
            </div>
          </div>
        )}

        {/* Último Sync */}
        {lastSync && (
          <div className="text-sm text-muted-foreground">
            <p>Última sincronização: {new Date(lastSync).toLocaleString('pt-BR')}</p>
          </div>
        )}

        {/* Issues */}
        {syncStatus.issues && syncStatus.issues.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Problemas encontrados:</strong>
              <ul className="list-disc list-inside mt-1">
                {syncStatus.issues.map((issue, index) => (
                  <li key={index} className="text-sm">{issue}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Botão de Sincronização */}
        <div className="flex gap-2">
          <Button
            onClick={handleSync}
            disabled={isLoading || !pricing}
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Sincronizando...' : 'Sincronizar Agora'}
          </Button>

          <Button
            onClick={checkSyncStatus}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Verificar Status
          </Button>
        </div>

        {/* Informação sobre Sincronização Automática */}
        <div className="bg-muted p-3 rounded-lg text-sm">
          <p className="font-medium mb-1">Sincronização Automática:</p>
          <p className="text-muted-foreground">
            Os preços são sincronizados automaticamente sempre que você salva as configurações. 
            Este painel permite verificação manual e resolução de problemas.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
