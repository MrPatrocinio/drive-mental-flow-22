
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { PricingService, PricingInfo } from '@/services/supabase/pricingService';
import { PromotionService } from '@/services/promotionService';
import { useDataSync } from '@/hooks/useDataSync';
import { Countdown } from '@/components/ui/countdown';
import { PromotionBadge } from '@/components/ui/promotion-badge';

export const PricingDisplay = () => {
  const [pricingData, setPricingData] = useState<PricingInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadPricingData = async () => {
    try {
      setIsLoading(true);
      const data = await PricingService.get();
      setPricingData(data || PricingService.getDefaultPricing());
    } catch (error) {
      console.error('Erro ao carregar dados de pricing:', error);
      setPricingData(PricingService.getDefaultPricing());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPricingData();
  }, []);

  useDataSync({
    onContentChange: () => {
      loadPricingData();
    }
  });

  const formatPrice = (price: number, currency: string) => {
    return `${currency} ${price.toFixed(2).replace('.', ',')}`;
  };

  const promotion = pricingData ? PromotionService.calculatePromotion(pricingData) : null;

  if (isLoading || !pricingData) {
    return (
      <div className="w-full max-w-none md:max-w-lg lg:max-w-xl mx-auto">
        <div className="pricing-card rounded-2xl p-6 md:p-8 text-center animate-pulse">
          <div className="h-6 bg-muted rounded mb-4 w-32 mx-auto"></div>
          <div className="h-12 bg-muted rounded mb-2 w-40 mx-auto"></div>
          <div className="h-4 bg-muted rounded mb-6 w-48 mx-auto"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-5 w-5 bg-muted rounded shrink-0 mt-0.5"></div>
                <div className="h-4 bg-muted rounded flex-1"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none md:max-w-lg lg:max-w-xl mx-auto">
      <div className="pricing-card rounded-2xl p-6 md:p-8 text-center">
        {promotion?.isValid && pricingData.promotion_label ? (
          <PromotionBadge 
            label={pricingData.promotion_label}
            discount={pricingData.discount_percentage}
            className="mb-4"
          />
        ) : (
          <Badge variant="premium" className="mb-4">
            Oferta Especial
          </Badge>
        )}
        
        <div className="mb-6">
          {promotion?.isValid ? (
            <div className="space-y-2">
              <div className="text-xl text-muted-foreground line-through">
                {formatPrice(promotion.originalPrice, pricingData.currency)}
              </div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-premium">
                {formatPrice(promotion.discountedPrice, pricingData.currency)}
              </div>
              {promotion.timeRemaining && pricingData.promotion_end_date && (
                <Countdown 
                  endDate={pricingData.promotion_end_date}
                  className="justify-center"
                />
              )}
            </div>
          ) : (
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-premium mb-2">
              {formatPrice(pricingData.price, pricingData.currency)}
            </div>
          )}
          <p className="text-sm md:text-base text-muted-foreground">
            Assinatura mensal • Acesso completo
          </p>
        </div>

        <div className="space-y-3 text-left">
          {pricingData.benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-3">
              <Check className="h-5 w-5 text-premium shrink-0 mt-0.5" />
              <span className="text-sm md:text-base leading-relaxed">{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
