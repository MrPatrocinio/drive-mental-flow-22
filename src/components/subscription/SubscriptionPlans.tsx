import { Check, Star, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';

const plans = [
  {
    id: 'basic',
    name: 'Básico',
    price: 'R$ 29',
    period: '/mês',
    description: 'Perfeito para começar sua jornada',
    icon: Star,
    features: [
      'Acesso a 50+ áudios de programação mental',
      'Playlists personalizadas',
      'Suporte por email',
      'Atualizações mensais de conteúdo'
    ],
    popular: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 'R$ 97',
    period: '/mês',
    description: 'A escolha mais popular para resultados completos',
    icon: Crown,
    features: [
      'Acesso completo a todos os áudios',
      'Playlists ilimitadas',
      'Novos áudios semanais',
      'Suporte prioritário',
      'Sessões de coaching mensais',
      'Acesso a comunidade VIP',
      'Downloads offline'
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'R$ 197',
    period: '/mês',
    description: 'Para organizações e profissionais',
    icon: Crown,
    features: [
      'Tudo do Premium',
      'Licenças para equipe (até 10 usuários)',
      'Conteúdo personalizado',
      'Relatórios de progresso',
      'Suporte 24/7',
      'Consultoria especializada',
      'API para integração'
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
            Escolha o Plano Ideal para Você
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transforme sua mente com nossa biblioteca completa de áudios de programação mental. 
            Escolha o plano que melhor se adapta às suas necessidades.
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
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
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

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            Todos os planos incluem 7 dias de garantia. Cancele a qualquer momento.
          </p>
        </div>
      </div>
    </div>
  );
};