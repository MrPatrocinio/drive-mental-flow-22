
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Copy } from 'lucide-react';
import { StripeEnvironmentService } from '@/services/stripe/stripeEnvironmentService';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

/**
 * Componente responsável por exibir informações de cartões de teste
 * Princípio SRP: Uma única responsabilidade - mostrar cartões de teste
 */
export const TestCardInfo = () => {
  const { toast } = useToast();
  const envInfo = StripeEnvironmentService.getEnvironmentInfo();
  const testCards = StripeEnvironmentService.getTestCards();

  // Só mostra em modo de teste
  if (!envInfo.isTestMode) {
    return null;
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Número do cartão copiado para a área de transferência",
    });
  };

  return (
    <Card className="bg-yellow-50 border-yellow-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg text-yellow-800">
          <CreditCard className="h-5 w-5" />
          Cartões de Teste
        </CardTitle>
        <p className="text-sm text-yellow-700">
          Use apenas estes cartões em modo de teste. Cartões reais serão recusados.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {testCards.map((card, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                  {card.number}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(card.number)}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </div>
            <Badge 
              variant={card.description.includes('Aprovado') ? 'default' : 'destructive'}
              className="text-xs"
            >
              {card.description.includes('Aprovado') ? 'Sucesso' : 'Falha'}
            </Badge>
          </div>
        ))}
        <div className="text-xs text-yellow-700 mt-3 p-2 bg-yellow-100 rounded">
          <strong>CVC:</strong> Qualquer 3 dígitos • <strong>Data:</strong> Qualquer data futura
        </div>
      </CardContent>
    </Card>
  );
};
