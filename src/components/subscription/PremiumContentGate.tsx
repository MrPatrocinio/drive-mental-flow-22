
import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Lock } from 'lucide-react';
import { useContentAccess } from '@/services/subscriptionAccessService';
import { useSecureSubscription } from '@/hooks/useSecureSubscription';

interface PremiumContentGateProps {
  children: ReactNode;
  contentTitle?: string;
  showPreview?: boolean;
  isPremium?: boolean;
  isDemoAudio?: boolean;
}

/**
 * Componente responsável por controlar acesso a conteúdo
 * Princípio SRP: Uma única responsabilidade - controle de acesso baseado em assinatura
 * Princípio KISS: Lógica simplificada - pagou = acesso / não pagou = gate
 * Atualizado para modelo de plano anual único
 */
export const PremiumContentGate = ({ 
  children, 
  contentTitle = 'Este conteúdo',
  showPreview = false,
  isPremium = true,
  isDemoAudio = false
}: PremiumContentGateProps) => {
  const { canAccessAudio, getAccessDeniedReason } = useContentAccess();
  const { createSubscription } = useSecureSubscription();

  // Verificar se pode acessar este áudio específico
  if (canAccessAudio(isPremium, isDemoAudio)) {
    return <>{children}</>;
  }

  // Usuário sem acesso: mostrar gate apenas para conteúdo premium
  const deniedReason = getAccessDeniedReason(isPremium);

  return (
    <div className="relative">
      {/* Preview limitado do conteúdo */}
      {showPreview && (
        <div className="opacity-30 pointer-events-none">
          {children}
        </div>
      )}
      
      {/* Overlay de upgrade para conteúdo premium */}
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
              {contentTitle} requer assinatura
            </CardTitle>
            
            <CardDescription className="text-sm">
              {deniedReason}
            </CardDescription>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={() => createSubscription('annual')}
              className="w-full"
              size="lg"
            >
              <Crown className="h-4 w-4 mr-2" />
              Assinar por R$ 127/ano
            </Button>
            
            <p className="text-xs text-muted-foreground">
              Acesso completo • Apenas R$ 10,58/mês
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
