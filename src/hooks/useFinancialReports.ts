import { useState, useEffect } from "react";
import { FinancialReportsService, FinancialMetrics, RevenueByPeriod, ChurnData } from "@/services/supabase/financialReportsService";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook para gerenciamento de relatórios financeiros
 * Responsabilidade: Estado e ações para componentes financeiros
 */
export const useFinancialReports = () => {
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueByPeriod[]>([]);
  const [churnData, setChurnData] = useState<ChurnData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const loadMetrics = async () => {
    const { data, error: metricsError } = await FinancialReportsService.getFinancialMetrics();
    
    if (metricsError) {
      setError(metricsError);
      toast({
        title: "Erro ao carregar métricas",
        description: metricsError,
        variant: "destructive",
      });
    } else {
      setMetrics(data);
    }
  };

  const loadRevenueData = async (months: number = 12) => {
    const { data, error: revenueError } = await FinancialReportsService.getRevenueByPeriod(months);
    
    if (revenueError) {
      setError(revenueError);
      toast({
        title: "Erro ao carregar dados de receita",
        description: revenueError,
        variant: "destructive",
      });
    } else {
      setRevenueData(data || []);
    }
  };

  const loadChurnData = async () => {
    const { data, error: churnError } = await FinancialReportsService.getChurnAnalysis();
    
    if (churnError) {
      setError(churnError);
      toast({
        title: "Erro ao carregar análise de churn",
        description: churnError,
        variant: "destructive",
      });
    } else {
      setChurnData(data || []);
    }
  };

  const refreshAllData = async () => {
    setLoading(true);
    setError(null);
    
    await Promise.all([
      loadMetrics(),
      loadRevenueData(),
      loadChurnData(),
    ]);
    
    setLoading(false);
  };

  const exportData = async (format: 'csv' | 'json' = 'csv') => {
    setExporting(true);
    
    try {
      const { data, error: exportError } = await FinancialReportsService.exportFinancialData(format);
      
      if (exportError || !data) {
        throw new Error(exportError || "Erro na exportação");
      }

      // Criar e baixar arquivo
      const blob = new Blob([data], { 
        type: format === 'csv' ? 'text/csv;charset=utf-8;' : 'application/json' 
      });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `relatorio_financeiro_${new Date().toISOString().split('T')[0]}.${format}`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Exportação concluída!",
        description: `Relatório exportado em formato ${format.toUpperCase()}`,
      });
    } catch (error: any) {
      toast({
        title: "Erro na exportação",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  return {
    metrics,
    revenueData,
    churnData,
    loading,
    error,
    exporting,
    refreshAllData,
    loadRevenueData,
    exportData,
  };
};