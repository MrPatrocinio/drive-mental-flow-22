
/**
 * Pricing Sync Service
 * Responsabilidade: Sincronização entre preços da landing page e Stripe
 * Princípios: SRP (uma responsabilidade), SSOT (fonte única), DRY (reutilização)
 */

import { PricingInfo } from '@/services/supabase/pricingService';
import { PromotionService } from '@/services/promotionService';
import { supabase } from '@/integrations/supabase/client';

export interface StripePricingData {
  amount: number; // em centavos
  currency: string;
  interval: 'year' | 'month';
  productName: string;
}

export class PricingSyncService {
  /**
   * Converte dados de pricing para formato Stripe
   * Princípio SRP: Responsabilidade única - conversão de dados
   */
  static convertToStripeFormat(pricing: PricingInfo): StripePricingData {
    const promotion = PromotionService.calculatePromotion(pricing);
    
    // Use preço promocional se válido, senão use preço normal
    const finalPrice = promotion.isValid ? promotion.discountedPrice : pricing.price;
    
    return {
      amount: Math.round(finalPrice * 100), // Converter para centavos
      currency: pricing.currency === 'R$' ? 'brl' : 'usd',
      interval: 'year', // Sempre anual conforme definido
      productName: `Drive Mental - Assinatura Anual${promotion.isValid && pricing.promotion_label ? ` - ${pricing.promotion_label}` : ''}`
    };
  }

  /**
   * Valida consistência entre pricing e dados do Stripe
   */
  static validatePricingConsistency(pricing: PricingInfo, stripeAmount: number): {
    isConsistent: boolean;
    expectedAmount: number;
    actualAmount: number;
    difference: number;
  } {
    const expectedStripeData = this.convertToStripeFormat(pricing);
    const difference = Math.abs(expectedStripeData.amount - stripeAmount);
    
    return {
      isConsistent: difference <= 1, // Tolerância de 1 centavo para arredondamentos
      expectedAmount: expectedStripeData.amount,
      actualAmount: stripeAmount,
      difference
    };
  }

  /**
   * Sincroniza preços entre sistemas
   * Princípio SSOT: Garante que há uma única fonte de verdade
   */
  static async syncPricingData(pricing: PricingInfo): Promise<{
    success: boolean;
    stripeData: StripePricingData;
    error?: string;
  }> {
    try {
      console.log('[PRICING_SYNC] Iniciando sincronização de preços');
      
      const stripeData = this.convertToStripeFormat(pricing);
      
      console.log('[PRICING_SYNC] Dados convertidos:', {
        originalPrice: pricing.price,
        finalAmount: stripeData.amount,
        currency: stripeData.currency,
        productName: stripeData.productName
      });

      // Validar se os dados estão dentro dos limites esperados
      if (stripeData.amount < 50 || stripeData.amount > 100000) {
        throw new Error(`Valor inválido: ${stripeData.amount} centavos está fora dos limites permitidos`);
      }

      // Notificar mudanças via DataSync para atualizar componentes
      import('@/services/dataSync').then(({ DataSyncService }) => {
        DataSyncService.forceNotification('pricing_sync', {
          event: 'SYNC',
          data: { stripeData, originalPricing: pricing }
        });
      });

      console.log('[PRICING_SYNC] Sincronização concluída com sucesso');
      
      return {
        success: true,
        stripeData
      };
    } catch (error) {
      console.error('[PRICING_SYNC] Erro na sincronização:', error);
      return {
        success: false,
        stripeData: this.convertToStripeFormat(pricing),
        error: (error as Error).message
      };
    }
  }

  /**
   * Verifica se os preços estão sincronizados
   */
  static async checkSyncStatus(): Promise<{
    isSynced: boolean;
    lastCheck: string;
    issues?: string[];
  }> {
    try {
      console.log('[PRICING_SYNC] Verificando status de sincronização');
      
      // Buscar dados atuais de pricing
      const { data: pricingData } = await supabase
        .from('landing_content')
        .select('content')
        .eq('section', 'pricing')
        .single();

      if (!pricingData?.content) {
        return {
          isSynced: false,
          lastCheck: new Date().toISOString(),
          issues: ['Dados de pricing não encontrados no banco']
        };
      }

      const pricing = pricingData.content as unknown as PricingInfo;
      const stripeData = this.convertToStripeFormat(pricing);
      
      // Verificar se há promoções expiradas
      const issues: string[] = [];
      
      if (pricing.has_promotion && !PromotionService.isPromotionValid(pricing.promotion_end_date)) {
        issues.push('Promoção expirada detectada');
      }

      if (stripeData.amount < 100) {
        issues.push('Preço muito baixo para Stripe (< R$ 1,00)');
      }

      return {
        isSynced: issues.length === 0,
        lastCheck: new Date().toISOString(),
        issues: issues.length > 0 ? issues : undefined
      };
    } catch (error) {
      console.error('[PRICING_SYNC] Erro na verificação:', error);
      return {
        isSynced: false,
        lastCheck: new Date().toISOString(),
        issues: [`Erro na verificação: ${(error as Error).message}`]
      };
    }
  }

  /**
   * Formata valor para exibição
   * Princípio DRY: Função reutilizável para formatação
   */
  static formatAmountForDisplay(amountInCents: number, currency: string = 'BRL'): string {
    const amount = amountInCents / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency === 'brl' ? 'BRL' : 'USD'
    }).format(amount);
  }
}
