
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
  // Filtrar apenas planos ativos, igual à landing page
  const activePlans = plansData.plans.filter(plan => plan.is_active !== false);
  const hasInactivePlans = plansData.plans.some(plan => plan.is_active === false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Preview - Como aparecerá na página</CardTitle>
          {hasInactivePlans && (
            <p className="text-xs text-center text-muted-foreground mt-2">
              ⚠️ Mostrando apenas planos ativos. Planos ocultos não aparecem na landing page.
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Escolha Seu Plano de Assinatura</h2>
              <p className="text-muted-foreground">
                Acesso completo a todos os áudios de programação mental.
              </p>
            </div>

            {activePlans.length === 0 ? (
              <div className="text-center p-8 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">
                  ⚠️ Nenhum plano ativo. Ative pelo menos um plano para exibir na landing page.
                </p>
              </div>
            ) : (
              <div className={`grid grid-cols-1 ${activePlans.length === 1 ? 'max-w-md mx-auto' : 'md:grid-cols-2 max-w-4xl mx-auto'} gap-6`}>
                {activePlans.map((plan) => {
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
                    {/* Badge de Visibilidade */}
                    <Badge className="absolute -top-3 left-4 bg-green-600 text-white">
                      👁️ VISÍVEL NA LANDING
                    </Badge>
                    
                    {plan.popular && (
                      <Badge className="absolute -top-3 right-4 bg-primary text-primary-foreground">
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
            )}

            {/* Mostrar planos ocultos (apenas para referência do admin) */}
            {hasInactivePlans && (
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-sm font-semibold text-center text-muted-foreground mb-4">
                  Planos Ocultos (não visíveis na landing page)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  {plansData.plans
                    .filter(plan => plan.is_active === false)
                    .map((plan) => {
                      const Icon = plan.popular ? Crown : Star;
                      return (
                        <Card 
                          key={plan.id}
                          className="relative opacity-50 border-dashed"
                        >
                          <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-muted text-muted-foreground">
                            👻 OCULTO
                          </Badge>
                          <CardHeader className="text-center pb-6">
                            <div className="flex justify-center mb-4">
                              <div className="p-3 rounded-full bg-muted">
                                <Icon className="h-6 w-6" />
                              </div>
                            </div>
                            <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{plan.description}</p>
                            <div className="mt-4">
                              <span className="text-3xl font-bold text-foreground">
                                {formatPrice(plan.price, plan.currency)}
                              </span>
                            </div>
                          </CardHeader>
                        </Card>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
