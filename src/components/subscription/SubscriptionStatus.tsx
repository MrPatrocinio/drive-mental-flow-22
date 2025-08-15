import { Calendar, Crown, RefreshCw, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const SubscriptionStatus = () => {
  const { 
    subscribed, 
    subscription_tier, 
    subscription_end, 
    isChecking, 
    checkSubscription, 
    openCustomerPortal 
  } = useSubscription();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const getTierName = (tier: string | null) => {
    const tierNames = {
      basic: 'Básico',
      premium: 'Premium',
      enterprise: 'Enterprise'
    };
    return tier ? tierNames[tier as keyof typeof tierNames] || tier : 'Nenhum';
  };

  const getTierColor = (tier: string | null) => {
    const colors = {
      basic: 'bg-blue-500',
      premium: 'bg-purple-500',
      enterprise: 'bg-gold-500'
    };
    return tier ? colors[tier as keyof typeof colors] || 'bg-gray-500' : 'bg-gray-500';
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
            Assine agora para ter acesso completo a todos os recursos do Drive Mental.
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
        <CardDescription>Você possui acesso premium</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <Badge className={`${getTierColor(subscription_tier)} text-white`}>
            Plano {getTierName(subscription_tier)}
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
            <span className="font-medium">{getTierName(subscription_tier)}</span>
          </div>
          
          <div className="flex items-start justify-between text-sm">
            <span className="text-muted-foreground">Renovação:</span>
            <div className="text-right">
              <div className="font-medium">{formatDate(subscription_end)}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Cobrança automática
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