
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Crown } from 'lucide-react';
import { SubscriptionPlansData } from '@/services/supabase/subscriptionPlansService';
import { PromotionService } from '@/services/promotionService';
import { PromotionBadge } from '@/components/ui/promotion-badge';
import { Countdown } from '@/components/ui/countdown';
import { formatPrice } from '@/utils/pricingUtils';

interface SubscriptionPlansPreviewProps {
  plansData: SubscriptionPlansData;
}

export const SubscriptionPlansPreview: React.FC<SubscriptionPlansPreviewProps> = ({ 
  plansData 
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Preview - Como aparecerá na página</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Escolha Seu Plano de Assinatura</h2>
              <p className="text-muted-foreground">
                Acesso completo a todos os áudios de programação mental.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plansData.plans.map((plan) => {
                const Icon = plan.popular ? Crown : Star;
                const promotion = PromotionService.calculatePromotion({
                  has_promotion: plan.has_promotion,
                  discount_percentage: plan.discount_percentage,
                  original_price: plan.original_price,
                  promotion_end_date: plan.promotion_end_date,
                  promotion_label: plan.promotion_label,
                  price: plan.price
                } as any);

                return (
                  <Card 
                    key={plan.id}
                    className={`relative transition-all duration-300 ${
                      plan.popular 
                        ? 'border-primary shadow-md scale-105' 
                        : 'border-border'
                    }`}
                  >
                    {plan.popular && (
                      <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                        Mais Popular
                      </Badge>
                    )}

                    <CardHeader className="text-center pb-6">
                      <div className="flex justify-center mb-4">
                        <div className={`p-3 rounded-full ${
                          plan.popular ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}>
                          <Icon className="h-6 w-6" />
                        </div>
                      </div>
                      <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                      
                      <div className="mt-4 space-y-2">
                        {promotion.isValid && plan.promotion_label && (
                          <PromotionBadge 
                            label={plan.promotion_label}
                            discount={plan.discount_percentage}
                            className="w-fit mx-auto mb-2"
                          />
                        )}
                        
                        <div className="flex items-center justify-center gap-2">
                          {promotion.isValid && (
                            <div className="text-lg text-muted-foreground line-through">
                              {formatPrice(promotion.originalPrice, plan.currency)}
                            </div>
                          )}
                          <span className="text-3xl font-bold text-foreground">
                            {formatPrice(promotion.discountedPrice, plan.currency)}
                          </span>
                        </div>
                        <div className="text-sm text-green-600 font-medium">{plan.savings}</div>
                        
                        {promotion.isValid && plan.promotion_end_date && (
                          <Countdown 
                            endDate={plan.promotion_end_date}
                            className="justify-center mt-2"
                          />
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="pb-6">
                      <ul className="space-y-3 mb-6">
                        {plansData.global_benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-foreground">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <Button
                        className="w-full"
                        variant={plan.popular ? 'default' : 'outline'}
                      >
                        {plansData.button_text}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
