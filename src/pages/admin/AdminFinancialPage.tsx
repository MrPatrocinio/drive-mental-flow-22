import React from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { useFinancialReports } from "@/hooks/useFinancialReports";
import { FinancialMetricsCards } from "@/components/admin/financial/FinancialMetricsCards";
import { RevenueChart } from "@/components/admin/financial/RevenueChart";
import { ChurnAnalysis } from "@/components/admin/financial/ChurnAnalysis";
import { DataExportPanel } from "@/components/admin/financial/DataExportPanel";
import { RefreshCw, DollarSign } from "lucide-react";

/**
 * Página de dashboard financeiro
 * Responsabilidade: Coordenação da interface financeira
 */
export default function AdminFinancialPage() {
  const {
    metrics,
    revenueData,
    churnData,
    loading,
    error,
    exporting,
    refreshAllData,
    exportData,
  } = useFinancialReports();

  const handleRefresh = async () => {
    await refreshAllData();
  };

  const handleExport = async (format: 'csv' | 'json') => {
    await exportData(format);
  };

  if (error) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard Financeiro</h1>
              <p className="text-muted-foreground">
                Erro ao carregar dados financeiros
              </p>
            </div>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
          
          <div className="text-center py-12">
            <div className="text-red-500 text-lg font-medium mb-2">
              Erro ao carregar dashboard financeiro
            </div>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Recarregar
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <DollarSign className="h-8 w-8" />
              Dashboard Financeiro
            </h1>
            <p className="text-muted-foreground">
              Relatórios de receita, métricas financeiras e análise de churn
            </p>
          </div>
          <Button 
            onClick={handleRefresh} 
            disabled={loading}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {/* Métricas Principais */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Métricas Principais</h2>
          <FinancialMetricsCards metrics={metrics} loading={loading} />
        </section>

        {/* Gráficos de Receita */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Análise de Receita</h2>
          <RevenueChart data={revenueData} loading={loading} />
        </section>

        {/* Grid com Análise de Churn e Exportação */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Análise de Churn</h2>
            <ChurnAnalysis data={churnData} loading={loading} />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Exportação</h2>
            <DataExportPanel onExport={handleExport} exporting={exporting} />
          </div>
        </div>

        {/* Insights e Recomendações */}
        {metrics && !loading && (
          <section className="bg-muted/50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">💡 Insights Automáticos</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h3 className="font-medium text-green-600">Pontos Positivos:</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Receita total de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.totalRevenue)}</li>
                  <li>• {metrics.activeSubscriptions} assinantes ativos</li>
                  <li>• LTV de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.customerLifetimeValue)}</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium text-orange-600">Áreas de Atenção:</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  {metrics.churnRate > 10 && <li>• Taxa de churn alta ({metrics.churnRate.toFixed(1)}%)</li>}
                  {metrics.averageRevenuePerUser < 50 && <li>• ARPU pode ser melhorado</li>}
                  <li>• Monitorar tendências de cancelamento</li>
                  <li>• Considerar estratégias de retenção</li>
                </ul>
              </div>
            </div>
          </section>
        )}
      </div>
    </AdminLayout>
  );
}