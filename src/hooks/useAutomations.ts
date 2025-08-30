import { useState, useEffect, startTransition } from "react";
import { AutomationService, AutomationRule, AutomationStats } from "@/services/automationService";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook para gerenciamento de automações
 * Responsabilidade: Estado e ações para componentes de automação
 */
export const useAutomations = () => {
  const [automations, setAutomations] = useState<AutomationRule[]>([]);
  const [stats, setStats] = useState<AutomationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [triggering, setTriggering] = useState<string | null>(null);
  const { toast } = useToast();

  const loadAutomations = async () => {
    const { data, error: automationsError } = await AutomationService.getAutomations();
    
    if (automationsError) {
      setError(automationsError);
      toast({
        title: "Erro ao carregar automações",
        description: automationsError,
        variant: "destructive",
      });
    } else {
      setAutomations(data || []);
    }
  };

  const loadStats = async () => {
    const { data, error: statsError } = await AutomationService.getAutomationStats();
    
    if (statsError) {
      setError(statsError);
      toast({
        title: "Erro ao carregar estatísticas",
        description: statsError,
        variant: "destructive",
      });
    } else {
      setStats(data);
    }
  };

  const toggleAutomation = async (automationId: string, isActive: boolean) => {
    const { success, error: toggleError } = await AutomationService.toggleAutomation(automationId, isActive);
    
    if (toggleError) {
      toast({
        title: "Erro ao alterar automação",
        description: toggleError,
        variant: "destructive",
      });
      return false;
    } else {
      toast({
        title: isActive ? "Automação ativada!" : "Automação desativada!",
        description: `A automação foi ${isActive ? 'ativada' : 'desativada'} com sucesso.`,
      });
      
      // Atualizar estado local
      setAutomations(prev => 
        prev.map(automation => 
          automation.id === automationId 
            ? { ...automation, isActive }
            : automation
        )
      );
      
      await loadStats(); // Recarregar estatísticas
      return true;
    }
  };

  const triggerAutomation = async (automationId: string, userEmail?: string) => {
    setTriggering(automationId);
    
    try {
      const { success, error: triggerError } = await AutomationService.triggerAutomation(automationId, userEmail);
      
      if (triggerError) {
        toast({
          title: "Erro ao executar automação",
          description: triggerError,
          variant: "destructive",
        });
        return false;
      } else {
        toast({
          title: "Automação executada!",
          description: "A automação foi executada com sucesso para teste.",
        });
        
        // Atualizar contador de triggers
        setAutomations(prev => 
          prev.map(automation => 
            automation.id === automationId 
              ? { 
                  ...automation, 
                  triggerCount: automation.triggerCount + 1,
                  lastTriggered: new Date().toISOString(),
                }
              : automation
          )
        );
        
        await loadStats(); // Recarregar estatísticas
        return true;
      }
    } finally {
      setTriggering(null);
    }
  };

  const createAutomation = async (automation: Omit<AutomationRule, 'id' | 'triggerCount' | 'lastTriggered'>) => {
    const { success, error: createError } = await AutomationService.createAutomation(automation);
    
    if (createError) {
      toast({
        title: "Erro ao criar automação",
        description: createError,
        variant: "destructive",
      });
      return false;
    } else {
      toast({
        title: "Automação criada!",
        description: "A nova automação foi criada com sucesso.",
      });
      
      await refreshAllData();
      return true;
    }
  };

  const deleteAutomation = async (automationId: string) => {
    const { success, error: deleteError } = await AutomationService.deleteAutomation(automationId);
    
    if (deleteError) {
      toast({
        title: "Erro ao remover automação",
        description: deleteError,
        variant: "destructive",
      });
      return false;
    } else {
      toast({
        title: "Automação removida!",
        description: "A automação foi removida com sucesso.",
      });
      
      // Remover do estado local
      setAutomations(prev => prev.filter(a => a.id !== automationId));
      await loadStats();
      return true;
    }
  };

  const refreshAllData = async () => {
    setLoading(true);
    setError(null);
    
    await Promise.all([
      loadAutomations(),
      loadStats(),
    ]);
    
    setLoading(false);
  };

  useEffect(() => {
    startTransition(() => {
      refreshAllData();
    });
  }, []);

  return {
    automations,
    stats,
    loading,
    error,
    triggering,
    refreshAllData,
    toggleAutomation,
    triggerAutomation,
    createAutomation,
    deleteAutomation,
  };
};