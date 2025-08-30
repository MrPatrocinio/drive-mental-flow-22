import { useState, useEffect, startTransition } from "react";
import { 
  AdvancedAnalyticsService, 
  ConversionFunnelStep, 
  UserBehaviorMetrics, 
  AdvancedMetrics 
} from "@/services/supabase/advancedAnalyticsService";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook para gerenciamento de analytics avançados
 * Responsabilidade: Estado e ações para componentes de analytics
 */
export const useAdvancedAnalytics = () => {
  const [conversionFunnel, setConversionFunnel] = useState<ConversionFunnelStep[]>([]);
  const [behaviorMetrics, setBehaviorMetrics] = useState<UserBehaviorMetrics | null>(null);
  const [advancedMetrics, setAdvancedMetrics] = useState<AdvancedMetrics | null>(null);
  const [userSegmentation, setUserSegmentation] = useState<Array<{ segment: string; users: number; percentage: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadConversionFunnel = async () => {
    const { data, error: funnelError } = await AdvancedAnalyticsService.getConversionFunnel();
    
    if (funnelError) {
      setError(funnelError);
      toast({
        title: "Erro ao carregar funil de conversão",
        description: funnelError,
        variant: "destructive",
      });
    } else {
      setConversionFunnel(data || []);
    }
  };

  const loadBehaviorMetrics = async () => {
    const { data, error: behaviorError } = await AdvancedAnalyticsService.getUserBehaviorMetrics();
    
    if (behaviorError) {
      setError(behaviorError);
      toast({
        title: "Erro ao carregar métricas comportamentais",
        description: behaviorError,
        variant: "destructive",
      });
    } else {
      setBehaviorMetrics(data);
    }
  };

  const loadAdvancedMetrics = async () => {
    const { data, error: metricsError } = await AdvancedAnalyticsService.getAdvancedMetrics();
    
    if (metricsError) {
      setError(metricsError);
      toast({
        title: "Erro ao carregar métricas avançadas",
        description: metricsError,
        variant: "destructive",
      });
    } else {
      setAdvancedMetrics(data);
    }
  };

  const loadUserSegmentation = async () => {
    const { data, error: segmentError } = await AdvancedAnalyticsService.getUserSegmentation();
    
    if (segmentError) {
      setError(segmentError);
      toast({
        title: "Erro ao carregar segmentação",
        description: segmentError,
        variant: "destructive",
      });
    } else {
      setUserSegmentation(data || []);
    }
  };

  const refreshAllData = async () => {
    setLoading(true);
    setError(null);
    
    await Promise.all([
      loadConversionFunnel(),
      loadBehaviorMetrics(),
      loadAdvancedMetrics(),
      loadUserSegmentation(),
    ]);
    
    setLoading(false);
  };

  useEffect(() => {
    startTransition(() => {
      refreshAllData();
    });
  }, []);

  return {
    conversionFunnel,
    behaviorMetrics,
    advancedMetrics,
    userSegmentation,
    loading,
    error,
    refreshAllData,
    loadConversionFunnel,
    loadBehaviorMetrics,
    loadAdvancedMetrics,
    loadUserSegmentation,
  };
};