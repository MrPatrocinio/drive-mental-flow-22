
import { Calendar, Crown, RefreshCw, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSecureSubscription } from '@/hooks/useSecureSubscription';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Componente para exibir status da assinatura
 * Princípio SRP: Uma responsabilidade - mostrar status da assinatura
 * Princípio KISS: Interface simplificada para plano anual único
 */
export const SubscriptionStatus = () => {
  const { 
    subscribed, 
    subscription_end, 
    isChecking, 
    checkSubscription, 
    openCustomerPortal 
  } = useSecureSubscription();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  if (!subscribed) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Crown className="h-5 w-5 text-muted-foreground" />
            Status da Assinatura
          </CardTitle>
          <CardDescription>Você não possui uma assinatura ativa</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <Badge variant="secondary" className="text-sm">
            Não Assinante
          </Badge>
          <p className="text-sm text-muted-foreground">
            Assine por apenas R$ 127,00/ano e tenha acesso completo.
          </p>
          <Button 
            onClick={checkSubscription} 
            variant="outline" 
            size="sm"
            disabled={isChecking}
            className="w-full"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Verificando...' : 'Verificar Status'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Crown className="h-5 w-5 text-primary" />
          Assinatura Ativa
        </CardTitle>
        <CardDescription>Você possui acesso completo</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <Badge className="bg-primary text-primary-foreground">
            Plano Anual
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status:</span>
            <Badge variant="default" className="bg-green-500 text-white">
              Ativo
            </Badge>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Plano:</span>
            <span className="font-medium">Anual - R$ 127,00</span>
          </div>
          
          <div className="flex items-start justify-between text-sm">
            <span className="text-muted-foreground">Renovação:</span>
            <div className="text-right">
              <div className="font-medium">{formatDate(subscription_end)}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Cobrança anual
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Button 
            onClick={openCustomerPortal} 
            variant="outline" 
            size="sm"
            className="w-full"
          >
            <Settings className="h-4 w-4 mr-2" />
            Gerenciar Assinatura
          </Button>
          
          <Button 
            onClick={checkSubscription} 
            variant="ghost" 
            size="sm"
            disabled={isChecking}
            className="w-full"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Verificando...' : 'Atualizar Status'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
