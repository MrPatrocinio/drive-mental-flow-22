
import { Check, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSecureSubscription } from '@/hooks/useSecureSubscription';

/**
 * Componente responsável por exibir plano anual único
 * Princípio SRP: Uma única responsabilidade - exibir plano de assinatura
 * Princípio KISS: Interface simplificada com apenas um plano
 * Princípio YAGNI: Remove complexidade desnecessária de múltiplos tiers
 */
export const SubscriptionPlans = () => {
  const { createSubscription, isLoading, subscribed } = useSecureSubscription();

  const handleSelectPlan = () => {
    createSubscription('annual');
  };

  // Plano anual único - R$ 127,00/ano
  const annualPlan = {
    name: 'Drive Mental',
    price: 'R$ 127',
    period: '/ano',
    description: 'Acesso completo por 1 ano',
    features: [
      'Acesso completo a todos os áudios de programação mental',
      'Playlists ilimitadas e personalizadas',
      'Novos áudios adicionados regularmente',
      'Downloads offline para escutar sem internet',
      'Suporte prioritário por email',
      'Acesso à comunidade exclusiva',
      'Garantia de 7 dias'
    ]
  };

  return (
    <div className="py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Transforme Sua Mente
          </h2>
          <p className="text-lg text-muted-foreground">
            Acesso completo à biblioteca de áudios de programação mental por apenas R$ 127,00/ano
          </p>
        </div>

        <div className="flex justify-center">
          <Card className="relative transition-all duration-300 hover:shadow-lg border-primary shadow-md w-full max-w-md">
            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
              Plano Anual
            </Badge>
            
            {subscribed && (
              <Badge className="absolute -top-3 right-4 bg-green-500 text-white">
                Ativo
              </Badge>
            )}

            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-primary text-primary-foreground">
                  <Crown className="h-6 w-6" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">{annualPlan.name}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {annualPlan.description}
              </CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-foreground">{annualPlan.price}</span>
                <span className="text-muted-foreground">{annualPlan.period}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Equivale a apenas R$ 10,58/mês
              </div>
            </CardHeader>

            <CardContent className="pb-6">
              <ul className="space-y-3">
                {annualPlan.features.map((feature, index) => (
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
                onClick={handleSelectPlan}
                disabled={isLoading || subscribed}
              >
                {subscribed ? 'Assinatura Ativa' : 'Assinar Agora'}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            ✓ Garantia de 7 dias • ✓ Cancele a qualquer momento • ✓ Pagamento seguro
          </p>
        </div>

        {/* Seção de benefícios */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-8">
            Por que escolher o Drive Mental?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧠</span>
              </div>
              <h4 className="font-semibold text-lg mb-2">Cientificamente Comprovado</h4>
              <p className="text-muted-foreground text-sm">
                Baseado em pesquisas de neurociência e psicologia cognitiva
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎧</span>
              </div>
              <h4 className="font-semibold text-lg mb-2">Qualidade Premium</h4>
              <p className="text-muted-foreground text-sm">
                Áudios produzidos com tecnologia de ponta e frequências específicas
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h4 className="font-semibold text-lg mb-2">Resultados Garantidos</h4>
              <p className="text-muted-foreground text-sm">
                Mais de 10.000 usuários já transformaram suas vidas
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
