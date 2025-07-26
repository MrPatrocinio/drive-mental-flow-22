import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { PricingInfo } from '@/services/supabase/pricingService';

interface PricingPreviewProps {
  pricing: PricingInfo;
}

export const PricingPreview: React.FC<PricingPreviewProps> = ({ pricing }) => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <Badge variant="secondary" className="w-fit mx-auto mb-4">
          Oferta Especial
        </Badge>
        <CardTitle className="text-3xl font-bold text-primary">
          {pricing.currency} {pricing.price.toFixed(2).replace('.', ',')}
        </CardTitle>
        <p className="text-muted-foreground">
          {pricing.payment_type} • {pricing.access_type}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {pricing.benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-3">
              <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <span className="text-sm">{benefit}</span>
            </div>
          ))}
        </div>
        <Button className="w-full mt-6" size="lg">
          {pricing.button_text}
        </Button>
      </CardContent>
    </Card>
  );
};