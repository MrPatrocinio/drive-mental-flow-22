import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PricingData } from '@/services/pricingService';
import { formatPrice } from '@/utils/pricingUtils';
import { Check, Eye } from 'lucide-react';

interface PricingPreviewProps {
  pricingData: PricingData;
}

export const PricingPreview = ({ pricingData }: PricingPreviewProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Preview da Landing Page
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg p-6 bg-gradient-to-br from-background to-muted/30">
          {/* Preview do card de preço */}
          <div className="max-w-sm mx-auto">
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Acesso Completo</h3>
                <div className="space-y-1">
                  <div className="text-4xl font-bold text-primary">
                    {formatPrice(pricingData.price, pricingData.currency)}
                  </div>
                  <p className="text-sm text-muted-foreground">Pagamento único</p>
                </div>
              </div>

              <div className="space-y-3">
                {pricingData.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              <Button className="w-full" size="lg">
                Começar Agora
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Este é um preview de como aparecerá na página de vendas
          </p>
        </div>
      </CardContent>
    </Card>
  );
};