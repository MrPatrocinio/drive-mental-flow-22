import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus } from 'lucide-react';
import { PricingInsert } from '@/services/supabase/pricingService';

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
    button_text: 'Começar Agora'
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
    
    await onSubmit({
      ...formData,
      benefits: filteredBenefits
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