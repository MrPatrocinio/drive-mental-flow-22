import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ComposedChart } from "recharts";
import { ChurnData } from "@/services/supabase/financialReportsService";
import { AlertTriangle, TrendingDown } from "lucide-react";

export interface ChurnAnalysisProps {
  data: ChurnData[];
  loading?: boolean;
}

/**
 * Análise de churn de usuários
 * Responsabilidade: Visualização da taxa de cancelamento
 */
export const ChurnAnalysis = ({ data, loading }: ChurnAnalysisProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Análise de Churn
          </CardTitle>
          <CardDescription>Carregando dados...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Análise de Churn
          </CardTitle>
          <CardDescription>Nenhum dado disponível</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            Sem dados para exibir
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calcular estatísticas
  const averageChurnRate = data.reduce((sum, item) => sum + item.churnRate, 0) / data.length;
  const totalChurnedUsers = data.reduce((sum, item) => sum + item.churnedUsers, 0);
  const latestData = data[data.length - 1];
  
  // Determinar tendência
  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));
  const firstHalfAvg = firstHalf.reduce((sum, item) => sum + item.churnRate, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, item) => sum + item.churnRate, 0) / secondHalf.length;
  const trend = secondHalfAvg < firstHalfAvg ? 'melhorando' : 'piorando';

  // Tooltip customizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-red-600">
              Taxa de Churn: {data.churnRate.toFixed(2)}%
            </p>
            <p className="text-orange-600">
              Usuários que Cancelaram: {data.churnedUsers}
            </p>
            <p className="text-blue-600">
              Total de Usuários: {data.totalUsers}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const getChurnColor = (churnRate: number) => {
    if (churnRate <= 5) return '#10b981'; // green-500
    if (churnRate <= 10) return '#f59e0b'; // yellow-500
    return '#ef4444'; // red-500
  };

  return (
    <div className="space-y-6">
      {/* Resumo das Métricas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Churn Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {averageChurnRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Últimos {data.length} meses
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Cancelado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {totalChurnedUsers}
            </div>
            <p className="text-xs text-muted-foreground">
              Usuários no período
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tendência</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold flex items-center gap-2 ${
              trend === 'melhorando' ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingDown className={`h-5 w-5 ${
                trend === 'melhorando' ? 'rotate-180' : ''
              }`} />
              {trend === 'melhorando' ? 'Melhorando' : 'Piorando'}
            </div>
            <p className="text-xs text-muted-foreground">
              Comparação 1ª vs 2ª metade
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico Combinado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Análise de Churn por Período
          </CardTitle>
          <CardDescription>
            Taxa de churn e número absoluto de cancelamentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                yAxisId="left"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                label={{ value: 'Usuários Cancelados', angle: -90, position: 'insideLeft' }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                label={{ value: 'Taxa de Churn (%)', angle: 90, position: 'insideRight' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                yAxisId="left"
                dataKey="churnedUsers" 
                fill="#f59e0b" 
                radius={[4, 4, 0, 0]}
                name="Usuários Cancelados"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="churnRate" 
                stroke="#ef4444" 
                strokeWidth={3}
                dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                name="Taxa de Churn"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detalhamento por Mês */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento Mensal</CardTitle>
          <CardDescription>
            Análise detalhada do churn por período
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{item.month}</h4>
                  <p className="text-sm text-muted-foreground">
                    {item.churnedUsers} de {item.totalUsers} usuários cancelaram
                  </p>
                </div>
                <div className="text-right">
                  <div 
                    className="text-lg font-bold"
                    style={{ color: getChurnColor(item.churnRate) }}
                  >
                    {item.churnRate.toFixed(2)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.churnRate <= 5 ? 'Excelente' : 
                     item.churnRate <= 10 ? 'Aceitável' : 'Atenção'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};