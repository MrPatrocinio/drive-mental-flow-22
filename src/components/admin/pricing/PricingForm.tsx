import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { X, Plus, Percent, Calendar } from 'lucide-react';
import { PricingInsert } from '@/services/supabase/pricingService';
import { PromotionService } from '@/services/promotionService';
import { formatPrice } from '@/utils/pricingUtils';

interface PricingFormProps {
  initialData?: PricingInsert;
  onSubmit: (data: PricingInsert) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  errors?: string[];
}

export const PricingForm: React.FC<PricingFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  errors = []
}) => {
  const [formData, setFormData] = useState<PricingInsert>({
    price: 97,
    currency: 'R$',
    payment_type: 'Pagamento único',
    access_type: 'Acesso vitalício',
    benefits: [''],
    button_text: 'Começar Agora',
    has_promotion: false,
    original_price: 97,
    discount_percentage: 0,
    promotion_end_date: '',
    promotion_label: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter empty benefits
    const filteredBenefits = formData.benefits.filter(benefit => benefit.trim() !== '');
    
    // Validate promotion data
    const promotionErrors = PromotionService.validatePromotionData({
      has_promotion: formData.has_promotion || false,
      discount_percentage: formData.discount_percentage,
      promotion_end_date: formData.promotion_end_date,
      original_price: formData.original_price
    });
    if (promotionErrors.length > 0) {
      // You might want to show these errors in the parent component
      console.error('Promotion validation errors:', promotionErrors);
    }
    
    await onSubmit({
      ...formData,
      benefits: filteredBenefits,
      // Ensure promotion price is set correctly
      price: formData.has_promotion && formData.discount_percentage 
        ? formData.original_price! - (formData.original_price! * formData.discount_percentage / 100)
        : formData.price
    });
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addBenefit = () => {
    setFormData(prev => ({
      ...prev,
      benefits: [...prev.benefits, '']
    }));
  };

  const removeBenefit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  const updateBenefit = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.map((benefit, i) => i === index ? value : benefit)
    }));
  };

  const togglePromotion = (enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      has_promotion: enabled,
      original_price: enabled ? prev.price : prev.original_price,
      discount_percentage: enabled ? prev.discount_percentage || 10 : 0,
      promotion_label: enabled ? prev.promotion_label || 'OFERTA ESPECIAL' : ''
    }));
  };

  const calculatePromotedPrice = () => {
    if (!formData.has_promotion || !formData.original_price || !formData.discount_percentage) {
      return formData.price;
    }
    return formData.original_price - (formData.original_price * formData.discount_percentage / 100);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Configurar Preços e Condições</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.length > 0 && (
            <div className="p-4 border border-destructive/20 rounded-md bg-destructive/10">
              <ul className="list-disc pl-4 space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm text-destructive">{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preço</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                placeholder="97.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Moeda</Label>
              <Select 
                value={formData.currency} 
                onValueChange={(value) => handleChange('currency', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a moeda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="R$">R$ (Real)</SelectItem>
                  <SelectItem value="US$">US$ (Dólar)</SelectItem>
                  <SelectItem value="€">€ (Euro)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_type">Tipo de Pagamento</Label>
              <Input
                id="payment_type"
                value={formData.payment_type}
                onChange={(e) => handleChange('payment_type', e.target.value)}
                placeholder="Pagamento único"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="access_type">Tipo de Acesso</Label>
              <Input
                id="access_type"
                value={formData.access_type}
                onChange={(e) => handleChange('access_type', e.target.value)}
                placeholder="Acesso vitalício"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="button_text">Texto do Botão</Label>
            <Input
              id="button_text"
              value={formData.button_text}
              onChange={(e) => handleChange('button_text', e.target.value)}
              placeholder="Começar Agora"
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Benefícios</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addBenefit}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Adicionar Benefício
              </Button>
            </div>

            <div className="space-y-3">
              {formData.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={benefit}
                    onChange={(e) => updateBenefit(index, e.target.value)}
                    placeholder="Digite um benefício..."
                    className="flex-1"
                  />
                  {formData.benefits.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeBenefit(index)}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Promotion Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-semibold">Sistema de Promoções</Label>
                <p className="text-sm text-muted-foreground">
                  Configure descontos e ofertas especiais
                </p>
              </div>
              <Switch
                checked={formData.has_promotion}
                onCheckedChange={togglePromotion}
              />
            </div>

            {formData.has_promotion && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="original_price">Preço Original</Label>
                    <Input
                      id="original_price"
                      type="number"
                      step="0.01"
                      value={formData.original_price || ''}
                      onChange={(e) => handleChange('original_price', parseFloat(e.target.value) || 0)}
                      placeholder="97.00"
                      required={formData.has_promotion}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discount_percentage">
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4" />
                        Desconto (%)
                      </div>
                    </Label>
                    <Input
                      id="discount_percentage"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.discount_percentage || ''}
                      onChange={(e) => handleChange('discount_percentage', parseFloat(e.target.value) || 0)}
                      placeholder="10"
                      required={formData.has_promotion}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="promotion_end_date">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Data de Fim da Promoção
                      </div>
                    </Label>
                    <Input
                      id="promotion_end_date"
                      type="datetime-local"
                      value={formData.promotion_end_date || ''}
                      onChange={(e) => handleChange('promotion_end_date', e.target.value)}
                      required={formData.has_promotion}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="promotion_label">Texto da Promoção</Label>
                    <Input
                      id="promotion_label"
                      value={formData.promotion_label || ''}
                      onChange={(e) => handleChange('promotion_label', e.target.value)}
                      placeholder="OFERTA ESPECIAL"
                    />
                  </div>
                </div>

                {/* Price Preview */}
                <div className="p-4 bg-background border rounded-lg">
                  <Label className="text-sm font-medium text-muted-foreground">Preview do Preço</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="text-lg text-muted-foreground line-through">
                      {formatPrice(formData.original_price || 0, formData.currency)}
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {formatPrice(calculatePromotedPrice(), formData.currency)}
                    </div>
                    <div className="px-2 py-1 bg-destructive text-destructive-foreground text-sm font-bold rounded">
                      {formData.discount_percentage}% OFF
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};