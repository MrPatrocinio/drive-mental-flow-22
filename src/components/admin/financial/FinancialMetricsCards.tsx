import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialMetrics } from "@/services/supabase/financialReportsService";
import { TrendingUp, DollarSign, Users, Activity, AlertTriangle, Award } from "lucide-react";

export interface FinancialMetricsCardsProps {
  metrics: FinancialMetrics | null;
  loading?: boolean;
}

/**
 * Cards com métricas financeiras principais
 * Responsabilidade: Exibição visual das métricas financeiras
 */
export const FinancialMetricsCards = ({ metrics, loading }: FinancialMetricsCardsProps) => {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Carregando...</CardTitle>
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded mb-1" />
              <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Erro ao carregar métricas financeiras</p>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getChurnColor = (churnRate: number) => {
    if (churnRate <= 5) return 'text-green-600';
    if (churnRate <= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
          <p className="text-xs text-muted-foreground">
            Acumulado até o momento
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.monthlyRevenue)}</div>
          <p className="text-xs text-muted-foreground">
            Receita recorrente mensal (MRR)
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.activeSubscriptions}</div>
          <p className="text-xs text-muted-foreground">
            Usuários com assinatura ativa
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">ARPU</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.averageRevenuePerUser)}</div>
          <p className="text-xs text-muted-foreground">
            Receita média por usuário
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taxa de Churn</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getChurnColor(metrics.churnRate)}`}>
            {metrics.churnRate.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            Cancelamentos mensais
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">LTV</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.customerLifetimeValue)}</div>
          <p className="text-xs text-muted-foreground">
            Valor vitalício do cliente
          </p>
        </CardContent>
      </Card>
    </div>
  );
};