
import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { SubscriptionPlansForm } from '@/components/admin/pricing/SubscriptionPlansForm';
import { SubscriptionPlansPreview } from '@/components/admin/pricing/SubscriptionPlansPreview';
import { SubscriptionPlansService, SubscriptionPlansData, SubscriptionPlansInsert } from '@/services/supabase/subscriptionPlansService';
import { SubscriptionValidationService } from '@/services/subscriptionValidationService';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

export const AdminSubscriptionPlansPage: React.FC = () => {
  const [plansData, setPlansData] = useState<SubscriptionPlansData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
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
      setWarnings([]);

      // Validar dados usando o serviço de validação
      const validation = SubscriptionValidationService.validatePlansData(data);
      
      if (!validation.isValid) {
        setErrors(validation.errors);
        toast({
          title: "Erro de Validação",
          description: "Corrija os erros encontrados antes de continuar",
          variant: "destructive",
        });
        return;
      }

      // Validar consistência entre planos
      const consistencyErrors = SubscriptionValidationService.validatePlansConsistency(data.plans);
      if (consistencyErrors.length > 0) {
        setErrors(consistencyErrors);
        toast({
          title: "Erro de Consistência",
          description: "Problemas de consistência encontrados nos planos",
          variant: "destructive",
        });
        return;
      }

      // Gerar warnings (não bloqueiam salvamento)
      const plansWarnings = SubscriptionValidationService.getPlansWarnings(data.plans);
      setWarnings(plansWarnings);

      const savedPlansData = await SubscriptionPlansService.save(data);
      setPlansData(savedPlansData);

      toast({
        title: "Sucesso",
        description: "Planos de assinatura atualizados com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao salvar planos:', error);
      
      let errorMessage = 'Erro ao salvar informações dos planos';
      
      // Tratar erros específicos
      if (error instanceof Error) {
        if (error.message.includes('23505')) {
          errorMessage = 'Erro de duplicação de dados. Tente novamente.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
        }
      }
      
      setErrors([errorMessage]);
      toast({
        title: "Erro",  
        description: errorMessage,
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
              <div className="space-y-4">
                {warnings.length > 0 && (
                  <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                    <CardContent className="pt-6">
                      <h4 className="font-semibold text-sm mb-2">⚠️ Sugestões de Otimização</h4>
                      <ul className="list-disc pl-4 space-y-1">
                        {warnings.map((warning, index) => (
                          <li key={index} className="text-sm text-muted-foreground">{warning}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
                <SubscriptionPlansForm
                  initialData={plansData}
                  onSubmit={handleSave}
                  isLoading={isSaving}
                  errors={errors}
                />
              </div>
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
