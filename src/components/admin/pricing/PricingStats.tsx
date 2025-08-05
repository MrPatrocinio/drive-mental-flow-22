import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PricingInfo } from '@/services/supabase/pricingService';
import { formatPrice } from '@/utils/pricingUtils';
import { TrendingUp, Package, Star } from 'lucide-react';

interface PricingStatsProps {
  pricingData: PricingInfo;
}

export const PricingStats = ({ pricingData }: PricingStatsProps) => {
  const stats = [
    {
      label: 'Preço Atual',
      value: formatPrice(pricingData.price, pricingData.currency),
      icon: TrendingUp,
      description: `em ${pricingData.currency}`,
    },
    {
      label: 'Total de Benefícios',
      value: pricingData.benefits.length.toString(),
      icon: Star,
      description: 'benefícios listados',
    },
    {
      label: 'Tipo de Pagamento',
      value: pricingData.payment_type,
      icon: Package,
      description: pricingData.access_type,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo da Configuração</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="flex-shrink-0">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-lg font-semibold truncate">
                  {stat.value}
                </p>
                {stat.description && (
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};