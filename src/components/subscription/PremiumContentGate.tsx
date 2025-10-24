
import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Lock } from 'lucide-react';
import { useContentAccess } from '@/services/subscriptionAccessService';
import { useSubscription } from '@/hooks/useSubscription';

interface PremiumContentGateProps {
  children: ReactNode;
  contentTitle?: string;
  showPreview?: boolean;
  isDemoAudio?: boolean;
}

/**
 * ✅ FASE 3: Gate simplificado - Modelo Paga/Não Paga
 * SEGURANÇA: Assinatura obrigatória para acessar conteúdo
 */
export const PremiumContentGate = ({ 
  children, 
  contentTitle = 'Este conteúdo',
  showPreview = false,
  isDemoAudio = false
}: PremiumContentGateProps) => {
  const { hasSubscriptionAccess } = useContentAccess();
  const { createSubscription } = useSubscription();

  // ✅ Demo ou assinatura ativa = acesso
  if (isDemoAudio || hasSubscriptionAccess) {
    return <>{children}</>;
  }

  // 🚫 Acesso negado - exibir tela de upgrade
  return (
    <div className="relative">
      {showPreview && (
        <div className="opacity-30 pointer-events-none">
          {children}
        </div>
      )}
      
      <Card className="absolute inset-0 bg-background/95 backdrop-blur-sm border-2 border-primary/20 flex items-center justify-center">
        <CardContent className="text-center space-y-6 p-8 max-w-md">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-primary/10">
              <Crown className="h-8 w-8 text-primary" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              <Lock className="h-3 w-3 mr-1" />
              Assinatura Necessária
            </Badge>
            
            <CardTitle className="text-xl">
              Assine para ter acesso completo
            </CardTitle>
            
            <CardDescription className="text-sm">
              Escolha um de nossos planos e tenha acesso a todos os áudios.
            </CardDescription>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={() => createSubscription('quarterly')}
              className="w-full"
              size="lg"
            >
              <Crown className="h-4 w-4 mr-2" />
              Escolher Plano
            </Button>
            
            <p className="text-xs text-muted-foreground">
              Trimestral, Semestral ou Anual - Todos com acesso completo
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
