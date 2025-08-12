
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield } from 'lucide-react';
import { StripeEnvironmentService } from '@/services/stripe/stripeEnvironmentService';

/**
 * Componente responsável por exibir o badge do ambiente atual
 * Princípio SRP: Uma única responsabilidade - mostrar ambiente
 */
export const EnvironmentBadge = () => {
  const envInfo = StripeEnvironmentService.getEnvironmentInfo();

  if (envInfo.isTestMode) {
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Modo Teste
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
      <Shield className="h-3 w-3 mr-1" />
      Produção
    </Badge>
  );
};
