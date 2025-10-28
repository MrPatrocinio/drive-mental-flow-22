
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2 } from 'lucide-react';
import { SubscriptionPlansInsert, SubscriptionPlan } from '@/services/supabase/subscriptionPlansService';
import { SubscriptionPlanForm } from './SubscriptionPlanForm';

interface SubscriptionPlansFormProps {
  initialData?: SubscriptionPlansInsert;
  onSubmit: (data: SubscriptionPlansInsert) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  errors?: string[];
}

export const SubscriptionPlansForm: React.FC<SubscriptionPlansFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  errors = []
}) => {
  const [formData, setFormData] = useState<SubscriptionPlansInsert>({
    plans: [
      {
        id: 'annual',
        name: 'Anual',
        price: 197.00,
        original_price: 197.00,
        currency: 'R$',
        interval: 'year',
        interval_count: 1,
        description: 'Renovação automática a cada 12 meses',
        savings: '',
        popular: true,
        is_active: true,
        has_promotion: false,
        discount_percentage: 0,
        promotion_end_date: null,
        promotion_label: ''
      },
      {
        id: 'annual_promo',
        name: 'Anual Promocional',
        price: 97.00,
        original_price: 197.00,
        currency: 'R$',
        interval: 'year',
        interval_count: 1,
        description: 'Renovação automática a cada 12 meses - Oferta Especial',
        savings: 'Economize R$ 100,00',
        popular: false,
        is_active: true,
        has_promotion: true,
        discount_percentage: 50,
        promotion_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        promotion_label: 'OFERTA LIMITADA'
      }
    ],
    global_benefits: [''],
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
    const filteredBenefits = formData.global_benefits.filter(benefit => benefit.trim() !== '');
    
    await onSubmit({
      ...formData,
      global_benefits: filteredBenefits
    });
  };

  const handlePlanUpdate = (planId: string, updatedPlan: SubscriptionPlan) => {
    setFormData(prev => ({
      ...prev,
      plans: prev.plans.map(plan => 
        plan.id === planId ? updatedPlan : plan
      )
    }));
  };

  const addBenefit = () => {
    setFormData(prev => ({
      ...prev,
      global_benefits: [...prev.global_benefits, '']
    }));
  };

  const removeBenefit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      global_benefits: prev.global_benefits.filter((_, i) => i !== index)
    }));
  };

  const updateBenefit = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      global_benefits: prev.global_benefits.map((benefit, i) => i === index ? value : benefit)
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurar Planos de Assinatura</CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure os planos disponíveis para assinatura e suas promoções
          </p>
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

            {/* Planos de Assinatura */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Planos de Assinatura</h3>
                <p className="text-sm text-muted-foreground">
                  Configure os 2 planos anuais: Plano Normal (R$ 197,00) e Plano Promocional (R$ 97,00)
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
                {formData.plans.map((plan, index) => (
                  <div key={plan.id} className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      {index === 0 ? 'Plano Anual Normal' : 'Plano Anual Promocional'}
                    </div>
                    <SubscriptionPlanForm
                      plan={plan}
                      onUpdate={handlePlanUpdate}
                    />
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Benefícios Globais */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Benefícios (Aplicáveis a Todos os Planos)</Label>
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
                {formData.global_benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={benefit}
                      onChange={(e) => updateBenefit(index, e.target.value)}
                      placeholder="Digite um benefício..."
                      className="flex-1"
                    />
                    {formData.global_benefits.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeBenefit(index)}
                        className="shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Configurações Gerais */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Configurações Gerais</h3>
              <div className="space-y-2">
                <Label htmlFor="button-text">Texto do Botão</Label>
                <Input
                  id="button-text"
                  value={formData.button_text}
                  onChange={(e) => setFormData(prev => ({ ...prev, button_text: e.target.value }))}
                  placeholder="Começar Agora"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Salvando...' : 'Salvar Configurações'}
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
    </div>
  );
};
