
/**
 * Hook para sincronização de preços
 * Responsabilidade: Interface React para serviço de sincronização
 * Princípios: SRP (uma responsabilidade), KISS (simples)
 */

import { useState, useCallback } from 'react';
import { PricingSyncService, StripePricingData } from '@/services/pricingSyncService';
import { PricingInfo } from '@/services/supabase/pricingService';
import { toast } from 'sonner';

export const usePricingSync = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<{
    isSynced: boolean;
    issues?: string[];
  }>({ isSynced: true });

  /**
   * Sincroniza dados de pricing
   */
  const syncPricing = useCallback(async (pricing: PricingInfo): Promise<StripePricingData | null> => {
    try {
      setIsLoading(true);
      console.log('[PRICING_SYNC_HOOK] Iniciando sincronização:', pricing);

      const result = await PricingSyncService.syncPricingData(pricing);

      if (result.success) {
        setLastSync(new Date().toISOString());
        setSyncStatus({ isSynced: true });
        
        toast.success('Preços sincronizados com sucesso!', {
          description: `Valor: ${PricingSyncService.formatAmountForDisplay(result.stripeData.amount)}`
        });

        return result.stripeData;
      } else {
        setSyncStatus({ 
          isSynced: false, 
          issues: [result.error || 'Erro desconhecido'] 
        });
        
        toast.error('Erro na sincronização', {
          description: result.error
        });

        return null;
      }
    } catch (error) {
      console.error('[PRICING_SYNC_HOOK] Erro:', error);
      toast.error('Erro na sincronização de preços');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Verifica status de sincronização
   */
  const checkSyncStatus = useCallback(async () => {
    try {
      const status = await PricingSyncService.checkSyncStatus();
      setSyncStatus({
        isSynced: status.isSynced,
        issues: status.issues
      });

      if (!status.isSynced && status.issues) {
        console.warn('[PRICING_SYNC_HOOK] Issues encontradas:', status.issues);
      }

      return status;
    } catch (error) {
      console.error('[PRICING_SYNC_HOOK] Erro na verificação:', error);
      setSyncStatus({ 
        isSynced: false, 
        issues: ['Erro na verificação de status'] 
      });
      return null;
    }
  }, []);

  /**
   * Converte pricing para formato Stripe
   */
  const getStripeData = useCallback((pricing: PricingInfo): StripePricingData => {
    return PricingSyncService.convertToStripeFormat(pricing);
  }, []);

  return {
    isLoading,
    lastSync,
    syncStatus,
    syncPricing,
    checkSyncStatus,
    getStripeData,
    formatAmount: PricingSyncService.formatAmountForDisplay
  };
};
