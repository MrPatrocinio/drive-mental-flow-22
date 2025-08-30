import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConversionFunnelStep } from "@/services/supabase/advancedAnalyticsService";
import { TrendingDown, Users } from "lucide-react";

export interface ConversionFunnelChartProps {
  data: ConversionFunnelStep[];
  loading?: boolean;
}

/**
 * Gráfico de funil de conversão
 * Responsabilidade: Visualização do funil de vendas/conversão
 */
export const ConversionFunnelChart = ({ data, loading }: ConversionFunnelChartProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Funil de Conversão
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
            <TrendingDown className="h-5 w-5" />
            Funil de Conversão
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

  const maxUsers = Math.max(...data.map(step => step.users));
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5" />
          Funil de Conversão
        </CardTitle>
        <CardDescription>
          Jornada do usuário desde visitante até conversão
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((step, index) => {
            const width = (step.users / maxUsers) * 100;
            const isLast = index === data.length - 1;
            
            return (
              <div key={step.step} className="space-y-2">
                {/* Barra do Funil */}
                <div className="relative">
                  <div 
                    className={`h-16 flex items-center justify-between px-4 rounded-lg transition-all duration-300 ${
                      index === 0 ? 'bg-blue-500' :
                      index === 1 ? 'bg-green-500' :
                      index === 2 ? 'bg-yellow-500' :
                      index === 3 ? 'bg-orange-500' :
                      'bg-red-500'
                    }`}
                    style={{ 
                      width: `${width}%`,
                      minWidth: '200px',
                      margin: '0 auto'
                    }}
                  >
                    <div className="text-white font-medium">
                      {step.step}
                    </div>
                    <div className="text-white text-sm">
                      <Users className="h-4 w-4 inline mr-1" />
                      {step.users.toLocaleString()}
                    </div>
                  </div>
                  
                  {/* Percentual de Conversão */}
                  <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 bg-background border rounded-full px-3 py-1 text-sm font-medium">
                    {step.conversionRate.toFixed(1)}%
                  </div>
                </div>
                
                {/* Seta de Transição */}
                {!isLast && (
                  <div className="flex items-center justify-center">
                    <div className="flex items-center text-muted-foreground text-sm">
                      <div className="w-8 h-px bg-muted mr-2" />
                      <div className="bg-muted rounded-full px-2 py-1">
                        -{step.dropoffRate.toFixed(1)}% abandono
                      </div>
                      <div className="w-8 h-px bg-muted ml-2" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Resumo das Métricas */}
        <div className="mt-8 pt-6 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {data[0]?.users.toLocaleString() || 0}
              </div>
              <div className="text-sm text-muted-foreground">Visitantes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {data[data.length - 1]?.users.toLocaleString() || 0}
              </div>
              <div className="text-sm text-muted-foreground">Conversões</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {data[data.length - 1]?.conversionRate.toFixed(1) || 0}%
              </div>
              <div className="text-sm text-muted-foreground">Taxa Final</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {(100 - (data[data.length - 1]?.conversionRate || 0)).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Abandono Total</div>
            </div>
          </div>
        </div>
        
        {/* Insights */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">💡 Insights:</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            {data.length > 1 && (
              <>
                <p>• Maior queda no passo: {data.reduce((max, step, index) => 
                  step.dropoffRate > (data[max] || { dropoffRate: 0 }).dropoffRate ? index : max, 0
                )}º ({data.reduce((max, step) => Math.max(max, step.dropoffRate), 0).toFixed(1)}% abandono)</p>
                <p>• Taxa de conversão global: {data[data.length - 1]?.conversionRate.toFixed(2)}%</p>
                {data[data.length - 1]?.conversionRate < 5 && (
                  <p>• ⚠️ Taxa de conversão baixa - considere otimizar o funil</p>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};