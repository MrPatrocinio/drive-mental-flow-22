import { useState, useCallback } from 'react';
import { pricingService, PricingData } from '@/services/pricingService';
import { useToast } from '@/hooks/use-toast';

export const usePricing = () => {
  const [pricingData, setPricingData] = useState<PricingData>(() => 
    pricingService.getPricingData()
  );
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const updatePricing = useCallback(async (data: PricingData) => {
    setIsLoading(true);
    try {
      await pricingService.savePricingData(data);
      setPricingData(data);
      toast({
        title: "Sucesso",
        description: "Configurações de preço atualizadas com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao salvar configurações",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const addBenefit = useCallback((benefit: string) => {
    if (benefit.trim()) {
      const newData = {
        ...pricingData,
        benefits: [...pricingData.benefits, benefit.trim()]
      };
      updatePricing(newData);
    }
  }, [pricingData, updatePricing]);

  const removeBenefit = useCallback((index: number) => {
    const newData = {
      ...pricingData,
      benefits: pricingData.benefits.filter((_, i) => i !== index)
    };
    updatePricing(newData);
  }, [pricingData, updatePricing]);

  const updateBenefit = useCallback((index: number, newBenefit: string) => {
    if (newBenefit.trim()) {
      const newData = {
        ...pricingData,
        benefits: pricingData.benefits.map((benefit, i) => 
          i === index ? newBenefit.trim() : benefit
        )
      };
      updatePricing(newData);
    }
  }, [pricingData, updatePricing]);

  return {
    pricingData,
    isLoading,
    updatePricing,
    addBenefit,
    removeBenefit,
    updateBenefit,
  };
};