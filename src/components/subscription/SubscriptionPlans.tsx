
import { useState, useEffect } from 'react';
import { Check, Star, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { SubscriptionPlansService, SubscriptionPlansData } from '@/services/supabase/subscriptionPlansService';
import { PromotionService } from '@/services/promotionService';
import { PromotionBadge } from '@/components/ui/promotion-badge';
import { Countdown } from '@/components/ui/countdown';
import { formatPrice } from '@/utils/pricingUtils';
import { useDataSync } from '@/hooks/useDataSync';

export const SubscriptionPlans = () => {
  const [plansData, setPlansData] = useState<SubscriptionPlansData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { createSubscription, isLoading: isCreatingSubscription, subscription_tier, subscribed } = useSubscription();

  const loadPlansData = async () => {
    try {
      setIsLoading(true);
      const data = await SubscriptionPlansService.get();
      setPlansData(data || SubscriptionPlansService.getDefaultPlansData());
    } catch (error) {
      console.error('Erro ao carregar dados dos planos:', error);
      setPlansData(SubscriptionPlansService.getDefaultPlansData());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlansData();
  }, []);

  useDataSync({
    onContentChange: () => {
      loadPlansData();
    }
  });

  const handleSelectPlan = (planId: string) => {
    createSubscription(planId);
  };

  const isCurrentPlan = (planId: string) => {
    return subscribed && subscription_tier === planId;
  };

  if (isLoading || !plansData) {
    return (
      <div className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="h-8 bg-muted rounded mb-4 w-64 mx-auto animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-80 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Escolha Seu Plano de Assinatura
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Acesso completo a todos os áudios de programação mental. 
            Quanto mais tempo você escolher, maior a economia!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plansData.plans.map((plan) => {
            const Icon = plan.popular ? Crown : Star;
            const isCurrent = isCurrentPlan(plan.id);
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
                className={`relative transition-all duration-300 hover:shadow-lg ${
                  plan.popular 
                    ? 'border-primary shadow-md scale-105' 
                    : 'border-border'
                } ${
                  isCurrent ? 'bg-primary/5 border-primary' : ''
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                    Mais Popular
                  </Badge>
                )}
                
                {isCurrent && (
                  <Badge className="absolute -top-3 right-4 bg-green-500 text-white">
                    Plano Atual
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
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {plan.description}
                  </CardDescription>
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
                      <span className="text-4xl font-bold text-foreground">
                        {formatPrice(promotion.discountedPrice, plan.currency)}
                      </span>
                      <div className="text-left">
                        <div className="text-sm text-muted-foreground">por período</div>
                      </div>
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
                  <ul className="space-y-3">
                    {plansData.global_benefits.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={isCreatingSubscription || isCurrent}
                  >
                    {isCurrent ? 'Plano Atual' : plansData.button_text}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12 space-y-4">
          <div className="bg-muted/50 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="font-semibold text-lg mb-2">✅ Agora Todos os Áudios São Inclusos!</h3>
            <p className="text-sm text-muted-foreground">
              Sem mais diferenciação entre áudios básicos ou premium. 
              Qualquer plano que você escolher dá acesso completo a toda nossa biblioteca.
            </p>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Todos os planos incluem 7 dias de garantia. Cancele a qualquer momento através do portal do cliente.
          </p>
        </div>
      </div>
    </div>
  );
};
