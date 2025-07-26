import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { PricingForm } from '@/components/admin/pricing/PricingForm';
import { PricingPreview } from '@/components/admin/pricing/PricingPreview';
import { PricingService, PricingInfo, PricingInsert } from '@/services/supabase/pricingService';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

export const AdminPricingPage: React.FC = () => {
  const [pricing, setPricing] = useState<PricingInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const { toast } = useToast();

  const loadPricing = async () => {
    try {
      setIsLoading(true);
      const data = await PricingService.get();
      
      if (data) {
        setPricing(data);
      } else {
        // Se não existe, criar com dados padrão
        const defaultData = PricingService.getDefaultPricing();
        setPricing(defaultData);
      }
    } catch (error) {
      console.error('Erro ao carregar preços:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar informações de preços",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPricing();
  }, []);

  const handleSave = async (data: PricingInsert) => {
    try {
      setIsSaving(true);
      setErrors([]);

      // Validações
      const validationErrors: string[] = [];
      
      if (!data.price || data.price <= 0) {
        validationErrors.push('Preço deve ser maior que zero');
      }
      
      if (!data.currency) {
        validationErrors.push('Moeda é obrigatória');
      }
      
      if (!data.payment_type) {
        validationErrors.push('Tipo de pagamento é obrigatório');
      }
      
      if (!data.access_type) {
        validationErrors.push('Tipo de acesso é obrigatório');
      }
      
      if (!data.button_text) {
        validationErrors.push('Texto do botão é obrigatório');
      }
      
      if (data.benefits.length === 0) {
        validationErrors.push('Pelo menos um benefício é obrigatório');
      }

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }

      const savedPricing = await PricingService.save(data);
      setPricing(savedPricing);

      toast({
        title: "Sucesso",
        description: "Informações de preços atualizadas com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao salvar preços:', error);
      setErrors(['Erro ao salvar informações de preços']);
      toast({
        title: "Erro",
        description: "Erro ao salvar informações de preços",
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
            <CardTitle>Gerenciar Preços e Condições</CardTitle>
            <p className="text-sm text-muted-foreground">
              Configure as informações de preços que aparecerão na página principal
            </p>
          </CardHeader>
        </Card>

        <Tabs defaultValue="edit" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit">Editar</TabsTrigger>
            <TabsTrigger value="preview">Visualizar</TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="mt-6">
            {pricing && (
              <PricingForm
                initialData={pricing}
                onSubmit={handleSave}
                isLoading={isSaving}
                errors={errors}
              />
            )}
          </TabsContent>

          <TabsContent value="preview" className="mt-6">
            {pricing && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-center">Preview - Como aparecerá na página</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PricingPreview pricing={pricing} />
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};