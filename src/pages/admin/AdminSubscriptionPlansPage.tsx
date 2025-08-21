
import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { SubscriptionPlansForm } from '@/components/admin/pricing/SubscriptionPlansForm';
import { SubscriptionPlansPreview } from '@/components/admin/pricing/SubscriptionPlansPreview';
import { SubscriptionPlansService, SubscriptionPlansData, SubscriptionPlansInsert } from '@/services/supabase/subscriptionPlansService';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

export const AdminSubscriptionPlansPage: React.FC = () => {
  const [plansData, setPlansData] = useState<SubscriptionPlansData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const { toast } = useToast();

  const loadPlansData = async () => {
    try {
      setIsLoading(true);
      const data = await SubscriptionPlansService.get();
      
      if (data) {
        setPlansData(data);
      } else {
        // Se não existe, criar com dados padrão
        const defaultData = SubscriptionPlansService.getDefaultPlansData();
        setPlansData(defaultData);
      }
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar informações dos planos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlansData();
  }, []);

  const handleSave = async (data: SubscriptionPlansInsert) => {
    try {
      setIsSaving(true);
      setErrors([]);

      // Validações
      const validationErrors: string[] = [];
      
      data.plans.forEach((plan, index) => {
        if (!plan.name) {
          validationErrors.push(`Nome do plano ${index + 1} é obrigatório`);
        }
        
        if (!plan.price || plan.price <= 0) {
          validationErrors.push(`Preço do plano ${plan.name} deve ser maior que zero`);
        }
        
        if (!plan.currency) {
          validationErrors.push(`Moeda do plano ${plan.name} é obrigatória`);
        }
        
        if (plan.has_promotion) {
          if (!plan.discount_percentage || plan.discount_percentage <= 0 || plan.discount_percentage > 100) {
            validationErrors.push(`Desconto do plano ${plan.name} deve ser entre 1% e 100%`);
          }
          
          if (!plan.promotion_end_date) {
            validationErrors.push(`Data de fim da promoção do plano ${plan.name} é obrigatória`);
          } else if (new Date(plan.promotion_end_date) <= new Date()) {
            validationErrors.push(`Data de fim da promoção do plano ${plan.name} deve ser no futuro`);
          }
          
          if (!plan.original_price || plan.original_price <= 0) {
            validationErrors.push(`Preço original do plano ${plan.name} deve ser maior que zero`);
          }
        }
      });
      
      if (!data.button_text) {
        validationErrors.push('Texto do botão é obrigatório');
      }
      
      if (data.global_benefits.length === 0) {
        validationErrors.push('Pelo menos um benefício é obrigatório');
      }

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }

      const savedPlansData = await SubscriptionPlansService.save(data);
      setPlansData(savedPlansData);

      toast({
        title: "Sucesso",
        description: "Planos de assinatura atualizados com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao salvar planos:', error);
      setErrors(['Erro ao salvar informações dos planos']);
      toast({
        title: "Erro",  
        description: "Erro ao salvar informações dos planos",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Gerenciar Planos de Assinatura</CardTitle>
            <p className="text-sm text-muted-foreground">
              Configure os planos de assinatura disponíveis e suas promoções
            </p>
          </CardHeader>
        </Card>

        <Tabs defaultValue="edit" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit">Editar</TabsTrigger>
            <TabsTrigger value="preview">Visualizar</TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="mt-6">
            {plansData && (
              <SubscriptionPlansForm
                initialData={plansData}
                onSubmit={handleSave}
                isLoading={isSaving}
                errors={errors}
              />
            )}
          </TabsContent>

          <TabsContent value="preview" className="mt-6">
            {plansData && (
              <SubscriptionPlansPreview plansData={plansData} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};
