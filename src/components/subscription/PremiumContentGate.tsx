
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
}

/**
 * Componente responsável por controlar acesso a conteúdo
 * Princípio SRP: Uma única responsabilidade - controle de acesso baseado em assinatura
 * Modelo: Todo conteúdo requer assinatura ativa
 */
export const PremiumContentGate = ({ 
  children, 
  contentTitle = 'Este conteúdo',
  showPreview = false 
}: PremiumContentGateProps) => {
  const { canAccessContent, getAccessDeniedReason } = useContentAccess();
  const { createSubscription } = useSubscription();

  // Usuário com assinatura ativa: permitir acesso
  if (canAccessContent()) {
    return <>{children}</>;
  }

  // Usuário sem assinatura: mostrar gate
  const deniedReason = getAccessDeniedReason();

  return (
    <div className="relative">
      {/* Preview limitado do conteúdo */}
      {showPreview && (
        <div className="opacity-30 pointer-events-none">
          {children}
        </div>
      )}
      
      {/* Overlay de upgrade */}
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
              Conteúdo Exclusivo
            </Badge>
            
            <CardTitle className="text-xl">
              {contentTitle} requer assinatura
            </CardTitle>
            
            <CardDescription className="text-sm">
              {deniedReason}
            </CardDescription>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={() => createSubscription('premium')}
              className="w-full"
              size="lg"
            >
              <Crown className="h-4 w-4 mr-2" />
              Assinar Agora
            </Button>
            
            <p className="text-xs text-muted-foreground">
              Acesse todo o conteúdo e transforme sua vida
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
