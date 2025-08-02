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
    <div className="w-full max-w-none md:max-w-lg lg:max-w-xl mx-auto">
      <div className="pricing-card rounded-2xl p-6 md:p-8 text-center">
        <Badge variant="premium" className="mb-4">
          Oferta Especial
        </Badge>
        
        <div className="mb-6">
          <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-premium mb-2">
            {formatPrice(pricingData.price, pricingData.currency)}
          </div>
          <p className="text-sm md:text-base text-muted-foreground">
            Pagamento único • Acesso vitalício
          </p>
        </div>

        <div className="space-y-3 text-left">
          {pricingData.benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-3">
              <Check className="h-5 w-5 text-premium shrink-0 mt-0.5" />
              <span className="text-sm md:text-base leading-relaxed">{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};