import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { PricingInfo } from '@/services/supabase/pricingService';
import { PromotionService } from '@/services/promotionService';
import { PromotionBadge } from '@/components/ui/promotion-badge';
import { Countdown } from '@/components/ui/countdown';
import { formatPrice } from '@/utils/pricingUtils';

interface PricingPreviewProps {
  pricing: PricingInfo;
}

export const PricingPreview: React.FC<PricingPreviewProps> = ({ pricing }) => {
  const promotion = PromotionService.calculatePromotion(pricing);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        {promotion.isValid && (
          <PromotionBadge 
            label={pricing.promotion_label} 
            discount={pricing.discount_percentage}
            className="w-fit mx-auto mb-4"
          />
        )}
        
        <div className="space-y-2">
          {promotion.isValid && (
            <div className="text-lg text-muted-foreground line-through">
              {formatPrice(promotion.originalPrice, pricing.currency)}
            </div>
          )}
          <CardTitle className="text-3xl font-bold text-primary">
            {formatPrice(promotion.discountedPrice, pricing.currency)}
          </CardTitle>
        </div>
        
        <p className="text-muted-foreground">
          {pricing.payment_type} • {pricing.access_type}
        </p>
        
        {promotion.isValid && pricing.promotion_end_date && (
          <Countdown 
            endDate={pricing.promotion_end_date} 
            className="justify-center mt-3"
          />
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {pricing.benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-3">
              <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <span className="text-sm">{benefit}</span>
            </div>
          ))}
        </div>
        <Button className="w-full mt-6" size="lg">
          {pricing.button_text}
        </Button>
      </CardContent>
    </Card>
  );
};