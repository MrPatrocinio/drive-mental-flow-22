import { supabase } from "@/integrations/supabase/client";

export interface FinancialMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  averageRevenuePerUser: number;
  totalTransactions: number;
  activeSubscriptions: number;
  churnRate: number;
  customerLifetimeValue: number;
}

export interface RevenueByPeriod {
  period: string;
  revenue: number;
  transactions: number;
  newSubscribers: number;
}

export interface ChurnData {
  month: string;
  churnedUsers: number;
  totalUsers: number;
  churnRate: number;
}

/**
 * Serviço responsável pelos relatórios financeiros
 * Responsabilidade: Cálculos financeiros e métricas de receita
 */
export class FinancialReportsService {
  
  /**
   * Busca métricas financeiras principais
   */
  static async getFinancialMetrics(): Promise<{ data: FinancialMetrics | null; error: string | null }> {
    try {
      // Total de assinantes ativos
      const { count: activeSubscriptions, error: subsError } = await supabase
        .from('subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('subscribed', true)
        .or('subscription_end.is.null,subscription_end.gt.now()');

      if (subsError) {
        return { data: null, error: subsError.message };
      }

      // Simular dados financeiros (em produção, viriam do Stripe)
      const totalRevenue = (activeSubscriptions || 0) * 29.90 * 3; // Simulando 3 meses médios
      const monthlyRevenue = (activeSubscriptions || 0) * 29.90;
      const averageRevenuePerUser = activeSubscriptions ? totalRevenue / activeSubscriptions : 0;
      
      // Calcular churn rate simples (em produção, viria de análise temporal)
      const churnRate = Math.max(0, Math.min(15, Math.random() * 10 + 5)); // Simulado: 5-15%
      
      // LTV = ARPU / Churn Rate
      const customerLifetimeValue = churnRate > 0 ? (29.90 * 12) / (churnRate / 100) : 0;
      
      const metrics: FinancialMetrics = {
        totalRevenue,
        monthlyRevenue,
        averageRevenuePerUser,
        totalTransactions: activeSubscriptions || 0,
        activeSubscriptions: activeSubscriptions || 0,
        churnRate,
        customerLifetimeValue,
      };

      return { data: metrics, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Busca receita por período
   */
  static async getRevenueByPeriod(months: number = 12): Promise<{ data: RevenueByPeriod[] | null; error: string | null }> {
    try {
      const { data: subscribers, error } = await supabase
        .from('subscribers')
        .select('created_at, subscribed')
        .order('created_at', { ascending: true });

      if (error) {
        return { data: null, error: error.message };
      }

      // Gerar dados simulados por mês
      const revenueData: RevenueByPeriod[] = [];
      const now = new Date();
      
      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStr = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
        
        // Simular crescimento progressivo
        const baseRevenue = 1000 + (months - i) * 500;
        const variance = Math.random() * 200 - 100; // ±100
        
        revenueData.push({
          period: monthStr,
          revenue: Math.max(0, baseRevenue + variance),
          transactions: Math.floor((baseRevenue + variance) / 29.90),
          newSubscribers: Math.floor(Math.random() * 10 + 5),
        });
      }

      return { data: revenueData, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Busca dados de churn
   */
  static async getChurnAnalysis(): Promise<{ data: ChurnData[] | null; error: string | null }> {
    try {
      // Simular dados de churn dos últimos 6 meses
      const churnData: ChurnData[] = [];
      const now = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStr = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        
        const totalUsers = 50 + (6 - i) * 15; // Crescimento simulado
        const churnedUsers = Math.floor(totalUsers * (Math.random() * 0.1 + 0.05)); // 5-15% churn
        const churnRate = (churnedUsers / totalUsers) * 100;
        
        churnData.push({
          month: monthStr,
          churnedUsers,
          totalUsers,
          churnRate: Math.round(churnRate * 100) / 100,
        });
      }

      return { data: churnData, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Exporta dados financeiros para CSV
   */
  static async exportFinancialData(format: 'csv' | 'json' = 'csv'): Promise<{ data: string | null; error: string | null }> {
    try {
      const { data: metrics } = await this.getFinancialMetrics();
      const { data: revenueData } = await this.getRevenueByPeriod();
      const { data: churnData } = await this.getChurnAnalysis();

      if (!metrics || !revenueData || !churnData) {
        return { data: null, error: "Erro ao buscar dados para exportação" };
      }

      if (format === 'json') {
        const exportData = {
          metrics,
          revenueByPeriod: revenueData,
          churnAnalysis: churnData,
          exportedAt: new Date().toISOString(),
        };
        return { data: JSON.stringify(exportData, null, 2), error: null };
      }

      // Formato CSV
      let csvContent = "RELATÓRIO FINANCEIRO\n";
      csvContent += `Exportado em: ${new Date().toLocaleString('pt-BR')}\n\n`;
      
      csvContent += "MÉTRICAS PRINCIPAIS\n";
      csvContent += "Métrica,Valor\n";
      csvContent += `Receita Total,R$ ${metrics.totalRevenue.toFixed(2)}\n`;
      csvContent += `Receita Mensal,R$ ${metrics.monthlyRevenue.toFixed(2)}\n`;
      csvContent += `ARPU,R$ ${metrics.averageRevenuePerUser.toFixed(2)}\n`;
      csvContent += `Assinaturas Ativas,${metrics.activeSubscriptions}\n`;
      csvContent += `Taxa de Churn,${metrics.churnRate.toFixed(2)}%\n`;
      csvContent += `LTV,R$ ${metrics.customerLifetimeValue.toFixed(2)}\n\n`;
      
      csvContent += "RECEITA POR PERÍODO\n";
      csvContent += "Período,Receita,Transações,Novos Assinantes\n";
      revenueData.forEach(item => {
        csvContent += `${item.period},R$ ${item.revenue.toFixed(2)},${item.transactions},${item.newSubscribers}\n`;
      });

      return { data: csvContent, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }
}