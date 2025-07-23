import { usePricing } from '@/hooks/usePricing';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

export const PricingDisplay = () => {
  const { pricingData } = usePricing();
  
  const formatPrice = (price: number, currency: string) => {
    const currencySymbol = currency === 'BRL' ? 'R$' : currency === 'USD' ? '$' : '€';
    return `${currencySymbol} ${price.toFixed(2).replace('.', ',')}`;
  };

  return (
    <div className="pricing-card rounded-2xl p-8 text-center max-w-lg mx-auto">
      <Badge variant="premium" className="mb-4">
        Oferta Especial
      </Badge>
      
      <div className="mb-6">
        <div className="text-4xl font-bold text-premium mb-2">
          {formatPrice(pricingData.price, pricingData.currency)}
        </div>
        <p className="text-muted-foreground">
          Pagamento único • Acesso vitalício
        </p>
      </div>

      <div className="space-y-3 text-left">
        {pricingData.benefits.map((benefit, index) => (
          <div key={index} className="flex items-start gap-3">
            <Check className="h-5 w-5 text-premium shrink-0 mt-0.5" />
            <span className="text-sm">{benefit}</span>
          </div>
        ))}
      </div>
    </div>
  );
};