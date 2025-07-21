import { SubscriptionPlans } from '@/components/subscription/SubscriptionPlans';
import { SubscriptionStatus } from '@/components/subscription/SubscriptionStatus';
import { Header } from '@/components/Header';
import { useSubscription } from '@/hooks/useSubscription';

export const SubscriptionPage = () => {
  const { subscribed } = useSubscription();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {subscribed ? 'Gerenciar Assinatura' : 'Escolha Seu Plano'}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {subscribed 
                ? 'Gerencie sua assinatura atual e explore outros planos disponíveis.'
                : 'Desbloqueie todo o potencial do Drive Mental com nossos planos de assinatura.'
              }
            </p>
          </div>

          {/* Subscription Status (if subscribed) */}
          {subscribed && (
            <div className="flex justify-center mb-12">
              <SubscriptionStatus />
            </div>
          )}

          {/* Subscription Plans */}
          <SubscriptionPlans />

          {/* Features Section */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-foreground mb-8">
              Por que escolher o Drive Mental?
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
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

          {/* FAQ Section */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-center text-foreground mb-8">
              Perguntas Frequentes
            </h3>
            
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold mb-2">Posso cancelar a qualquer momento?</h4>
                <p className="text-muted-foreground text-sm">
                  Sim, você pode cancelar sua assinatura a qualquer momento através do portal do cliente. 
                  Não há taxas de cancelamento.
                </p>
              </div>
              
              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold mb-2">Os áudios funcionam offline?</h4>
                <p className="text-muted-foreground text-sm">
                  Sim, assinantes Premium e Enterprise podem baixar os áudios para escutar offline.
                </p>
              </div>
              
              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold mb-2">Há garantia de devolução?</h4>
                <p className="text-muted-foreground text-sm">
                  Oferecemos 7 dias de garantia total. Se não ficar satisfeito, 
                  devolvemos 100% do seu dinheiro.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};