import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Calendar, CreditCard, Mail, ExternalLink, Sparkles } from "lucide-react";
import { EnvironmentBadge } from "@/components/ui/environment-badge";
import { useSubscription } from "@/hooks/useSubscription";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * SubscriptionSuccessPage - Página de sucesso específica para assinaturas recorrentes
 * Responsabilidade (SRP): Confirmar assinatura, mostrar detalhes e próximos passos
 * Diferente de PaymentSuccessPage que é para pagamentos avulsos
 */
export default function SubscriptionSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { 
    subscribed, 
    subscription_tier, 
    subscription_end,
    subscription_status,
    isChecking,
    openCustomerPortal 
  } = useSubscription();
  const [isLoading, setIsLoading] = useState(true);
  
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // Marca no localStorage que usuário acabou de assinar (para banner de boas-vindas)
    localStorage.setItem('justSubscribed', 'true');
    
    // Pequeno delay para garantir que webhook processou
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const getTierName = (tier: string | null) => {
    const tierNames: Record<string, string> = {
      quarterly: 'Trimestral',
      semiannual: 'Semestral',
      annual: 'Anual',
      premium: 'Premium',
      basic: 'Básico',
      enterprise: 'Enterprise'
    };
    return tier ? tierNames[tier] || tier : 'Premium';
  };

  const getTierPrice = (tier: string | null) => {
    const prices: Record<string, string> = {
      quarterly: 'R$ 49,90/mês',
      semiannual: 'R$ 44,90/mês',
      annual: 'R$ 39,90/mês',
      premium: 'R$ 49,90/mês'
    };
    return tier ? prices[tier] || 'Consulte detalhes' : 'R$ 49,90/mês';
  };

  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen hero-gradient">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-center mb-6">
              <EnvironmentBadge />
            </div>
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-lg">Carregando detalhes da assinatura...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen hero-gradient">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center mb-6">
            <EnvironmentBadge />
          </div>

          {/* Hero Section */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Check className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Assinatura Ativada!
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              Bem-vindo ao Drive Mental Premium
            </p>
            <Badge className="bg-green-500 text-white">
              <Crown className="h-3 w-3 mr-1" />
              Acesso 100% Ativo
            </Badge>
          </div>

          {/* Subscription Details Card */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Detalhes da Assinatura
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Plano:</span>
                <span className="font-semibold">{getTierName(subscription_tier)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Valor:</span>
                <span className="font-semibold">{getTierPrice(subscription_tier)}</span>
              </div>

              {subscription_end && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Próxima cobrança:</span>
                  <div className="text-right">
                    <div className="font-semibold">{formatDate(subscription_end)}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                      <Calendar className="h-3 w-3" />
                      Renovação automática
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge className="bg-green-500 text-white">
                  {subscription_status === 'active' ? 'Ativo' : 'Processando'}
                </Badge>
              </div>

              {sessionId && (
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    ID da Sessão: <code className="text-xs bg-muted px-1 py-0.5 rounded">{sessionId}</code>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Benefits Card */}
          <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 mb-6">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Seu Acesso Premium Inclui:
              </h3>
              <div className="space-y-2 text-sm">
                <p>✅ Acesso ilimitado a todos os áudios</p>
                <p>✅ Download para uso offline</p>
                <p>✅ Conteúdos exclusivos premium</p>
                <p>✅ Novas programações mentais mensais</p>
                <p>✅ Suporte prioritário</p>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps Card */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Próximos Passos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Confirmação por E-mail</p>
                  <p className="text-sm text-muted-foreground">
                    Enviamos um e-mail com os detalhes da sua assinatura
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Comece Agora</p>
                  <p className="text-sm text-muted-foreground">
                    Explore todo o conteúdo premium disponível no dashboard
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={() => navigate("/dashboard")} 
              variant="default" 
              size="lg"
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Começar a Usar Agora
            </Button>
            
            {subscribed && (
              <Button 
                onClick={openCustomerPortal} 
                variant="outline" 
                size="lg"
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Gerenciar no Portal Stripe
              </Button>
            )}
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              Precisa de ajuda? Entre em contato com nosso{" "}
              <a href="mailto:suporte@drivemental.com" className="text-primary hover:underline">
                suporte
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
