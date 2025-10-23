
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Percent, Calendar, Star, Crown } from 'lucide-react';
import { SubscriptionPlan } from '@/services/supabase/subscriptionPlansService';
import { formatPrice } from '@/utils/pricingUtils';

interface SubscriptionPlanFormProps {
  plan: SubscriptionPlan;
  onUpdate: (planId: string, updatedPlan: SubscriptionPlan) => void;
}

export const SubscriptionPlanForm: React.FC<SubscriptionPlanFormProps> = ({
  plan,
  onUpdate
}) => {
  const handleChange = (field: keyof SubscriptionPlan, value: any) => {
    onUpdate(plan.id, {
      ...plan,
      [field]: value
    });
  };

  const togglePromotion = (enabled: boolean) => {
    const updatedPlan = {
      ...plan,
      has_promotion: enabled,
      discount_percentage: enabled ? plan.discount_percentage || 10 : 0,
      promotion_label: enabled ? plan.promotion_label || 'OFERTA ESPECIAL' : '',
      promotion_end_date: enabled ? plan.promotion_end_date || '2025-01-31T23:59:59' : null
    };
    onUpdate(plan.id, updatedPlan);
  };

  const calculatePromotedPrice = () => {
    if (!plan.has_promotion || !plan.original_price || !plan.discount_percentage) {
      return plan.price;
    }
    return plan.original_price - (plan.original_price * plan.discount_percentage / 100);
  };

  const getIcon = () => {
    return plan.popular ? Crown : Star;
  };

  const Icon = getIcon();

  return (
    <Card className={`relative ${plan.is_active === false ? 'opacity-50 border-dashed' : ''} ${plan.popular ? 'border-primary shadow-md' : 'border-border'}`}>
      {plan.popular && (
        <Badge className="absolute -top-2 left-4 bg-primary text-primary-foreground">
          Mais Popular
        </Badge>
      )}
      
      {plan.is_active === false && (
        <Badge className="absolute -top-2 right-4 bg-muted text-muted-foreground border-dashed">
          Desativado
        </Badge>
      )}
      
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-2">
          <div className={`p-2 rounded-full ${plan.popular ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <CardTitle className="text-lg">{plan.name}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Toggle de Ativação */}
        <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/10">
          <div className="space-y-1">
            <Label className="font-semibold">Status do Plano</Label>
            <p className="text-xs text-muted-foreground">
              {plan.is_active !== false ? 'Plano ativo e visível na página principal' : 'Plano desativado e oculto'}
            </p>
          </div>
          <Switch
            checked={plan.is_active !== false}
            onCheckedChange={(value) => handleChange('is_active', value)}
          />
        </div>
        {/* Informações Básicas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor={`${plan.id}-price`}>Preço</Label>
            <Input
              id={`${plan.id}-price`}
              type="number"
              step="0.01"
              value={plan.price}
              onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${plan.id}-currency`}>Moeda</Label>
            <Select 
              value={plan.currency} 
              onValueChange={(value) => handleChange('currency', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="R$">R$ (Real)</SelectItem>
                <SelectItem value="US$">US$ (Dólar)</SelectItem>
                <SelectItem value="€">€ (Euro)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${plan.id}-description`}>Descrição</Label>
          <Input
            id={`${plan.id}-description`}
            value={plan.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Renovação automática..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${plan.id}-savings`}>Economia</Label>
          <Input
            id={`${plan.id}-savings`}
            value={plan.savings}
            onChange={(e) => handleChange('savings', e.target.value)}
            placeholder="Economize R$ X,XX"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label>Plano Popular</Label>
          <Switch
            checked={plan.popular}
            onCheckedChange={(value) => handleChange('popular', value)}
          />
        </div>

        {/* Sistema de Promoções */}
        <div className="space-y-4 p-3 border rounded-lg bg-muted/20">
          <div className="flex items-center justify-between">
            <Label className="font-semibold">Sistema de Promoções</Label>
            <Switch
              checked={plan.has_promotion}
              onCheckedChange={togglePromotion}
            />
          </div>

          {plan.has_promotion && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor={`${plan.id}-original-price`}>Preço Original</Label>
                  <Input
                    id={`${plan.id}-original-price`}
                    type="number"
                    step="0.01"
                    value={plan.original_price}
                    onChange={(e) => handleChange('original_price', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`${plan.id}-discount`}>
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4" />
                      Desconto (%)
                    </div>
                  </Label>
                  <Input
                    id={`${plan.id}-discount`}
                    type="number"
                    min="1"
                    max="100"
                    value={plan.discount_percentage}
                    onChange={(e) => handleChange('discount_percentage', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor={`${plan.id}-end-date`}>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Fim da Promoção
                    </div>
                  </Label>
                  <Input
                    id={`${plan.id}-end-date`}
                    type="datetime-local"
                    value={plan.promotion_end_date?.slice(0, 16) || ''}
                    onChange={(e) => handleChange('promotion_end_date', e.target.value ? `${e.target.value}:00` : null)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`${plan.id}-label`}>Texto da Promoção</Label>
                  <Input
                    id={`${plan.id}-label`}
                    value={plan.promotion_label}
                    onChange={(e) => handleChange('promotion_label', e.target.value)}
                    placeholder="OFERTA ESPECIAL"
                  />
                </div>
              </div>

              {/* Preview do Preço */}
              <div className="p-3 bg-background border rounded-lg">
                <Label className="text-sm font-medium text-muted-foreground">Preview do Preço</Label>
                <div className="flex items-center gap-3 mt-2">
                  <div className="text-sm text-muted-foreground line-through">
                    {formatPrice(plan.original_price, plan.currency)}
                  </div>
                  <div className="text-lg font-bold text-primary">
                    {formatPrice(calculatePromotedPrice(), plan.currency)}
                  </div>
                  <div className="px-2 py-1 bg-destructive text-destructive-foreground text-xs font-bold rounded">
                    {plan.discount_percentage}% OFF
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
