
import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Lock } from 'lucide-react';
import { useContentAccess } from '@/services/subscriptionAccessService';
import { useSubscription } from '@/hooks/useSubscription';

interface PremiumContentGateProps {
  children: ReactNode;
  isPremium: boolean;
  contentTitle?: string;
  showPreview?: boolean;
}

/**
 * Componente responsável por controlar acesso a conteúdo premium
 * Princípio SRP: Uma única responsabilidade - controle de acesso
 */
export const PremiumContentGate = ({ 
  children, 
  isPremium, 
  contentTitle = 'Este conteúdo',
  showPreview = false 
}: PremiumContentGateProps) => {
  const { canAccessAudio, getAccessDeniedReason } = useContentAccess();
  const { createSubscription } = useSubscription();

  // Conteúdo gratuito: sempre permitir acesso
  if (!isPremium) {
    return <>{children}</>;
  }

  // Conteúdo premium com acesso: permitir acesso
  if (canAccessAudio(isPremium)) {
    return <>{children}</>;
  }

  // Conteúdo premium sem acesso: mostrar gate
  const deniedReason = getAccessDeniedReason(isPremium);

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
              Conteúdo Premium
            </Badge>
            
            <CardTitle className="text-xl">
              {contentTitle} é Premium
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
              Assinar Premium
            </Button>
            
            <p className="text-xs text-muted-foreground">
              Acesse todo o conteúdo premium e muito mais
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
