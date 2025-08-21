
import { Check, Star, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';

const plans = [
  {
    id: 'quarterly',
    name: 'Trimestral',
    price: 'R$ 89',
    period: '90',
    originalPrice: 'R$ 89,70',
    savings: 'Economize R$ 0,80',
    description: 'Renovação automática a cada 3 meses',
    icon: Star,
    features: [
      'Acesso completo a todos os áudios',
      'Playlists ilimitadas',
      'Downloads offline',
      'Suporte especializado',
      'Atualizações constantes de conteúdo',
      'Cancelamento a qualquer momento'
    ],
    popular: false,
  },
  {
    id: 'semiannual',
    name: 'Semestral',
    price: 'R$ 159',
    period: '90',
    originalPrice: 'R$ 179,40',
    savings: 'Economize R$ 20,40',
    description: 'Renovação automática a cada 6 meses - Mais Popular',
    icon: Crown,
    features: [
      'Acesso completo a todos os áudios',
      'Playlists ilimitadas', 
      'Downloads offline',
      'Suporte prioritário',
      'Atualizações constantes de conteúdo',
      'Cancelamento a qualquer momento',
      '11% de desconto vs trimestral'
    ],
    popular: true,
  },
  {
    id: 'annual',
    name: 'Anual',
    price: 'R$ 299',
    period: '90',
    originalPrice: 'R$ 358,80',
    savings: 'Economize R$ 59,80',
    description: 'Renovação automática a cada 12 meses',
    icon: Crown,
    features: [
      'Acesso completo a todos os áudios',
      'Playlists ilimitadas',
      'Downloads offline', 
      'Suporte VIP prioritário',
      'Atualizações constantes de conteúdo',
      'Cancelamento a qualquer momento',
      '17% de desconto vs trimestral',
      'Melhor custo-benefício'
    ],
    popular: false,
  }
];

export const SubscriptionPlans = () => {
  const { createSubscription, isLoading, subscription_tier, subscribed } = useSubscription();

  const handleSelectPlan = (planId: string) => {
    createSubscription(planId);
  };

  const isCurrentPlan = (planId: string) => {
    return subscribed && subscription_tier === planId;
  };

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
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = isCurrentPlan(plan.id);
            
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
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                      <div className="text-left">
                        <div className="text-sm text-muted-foreground">por período</div>
                      </div>
                    </div>
                    <div className="text-sm text-green-600 font-medium">{plan.savings}</div>
                    <div className="text-xs text-muted-foreground line-through">{plan.originalPrice}</div>
                  </div>
                </CardHeader>

                <CardContent className="pb-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
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
                    disabled={isLoading || isCurrent}
                  >
                    {isCurrent ? 'Plano Atual' : `Assinar ${plan.name}`}
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
