import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { RevenueByPeriod } from "@/services/supabase/financialReportsService";
import { TrendingUp } from "lucide-react";

export interface RevenueChartProps {
  data: RevenueByPeriod[];
  loading?: boolean;
}

/**
 * Gráfico de receita por período
 * Responsabilidade: Visualização da evolução da receita
 */
export const RevenueChart = ({ data, loading }: RevenueChartProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Evolução da Receita
          </CardTitle>
          <CardDescription>Carregando dados...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Evolução da Receita
          </CardTitle>
          <CardDescription>Nenhum dado disponível</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Sem dados para exibir
          </div>
        </CardContent>
      </Card>
    );
  }

  // Formatador customizado para valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Tooltip customizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-blue-600">
              Receita: {formatCurrency(data.revenue)}
            </p>
            <p className="text-green-600">
              Transações: {data.transactions}
            </p>
            <p className="text-purple-600">
              Novos Assinantes: {data.newSubscribers}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Gráfico de Linha - Receita */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Evolução da Receita
          </CardTitle>
          <CardDescription>
            Receita mensal ao longo do tempo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="period" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatCurrency}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Barras - Novos Assinantes */}
      <Card>
        <CardHeader>
          <CardTitle>Novos Assinantes por Mês</CardTitle>
          <CardDescription>
            Crescimento da base de usuários
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="period" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  value, 
                  name === 'newSubscribers' ? 'Novos Assinantes' : name
                ]}
                labelFormatter={(label) => `Período: ${label}`}
              />
              <Bar 
                dataKey="newSubscribers" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};