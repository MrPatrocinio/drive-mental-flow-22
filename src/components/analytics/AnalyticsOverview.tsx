import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalyticsMetrics } from "@/hooks/useAnalytics";
import { TrendingUp, Users, Activity, BarChart3 } from "lucide-react";

export const AnalyticsOverview = () => {
  const { data: metrics, isLoading } = useAnalyticsMetrics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Erro ao carregar métricas</p>
      </div>
    );
  }

  const cards = [
    {
      title: "Total de Eventos",
      value: metrics.totalEvents,
      description: "Eventos rastreados",
      icon: Activity,
    },
    {
      title: "Usuários Únicos",
      value: metrics.uniqueUsers,
      description: "Usuários ativos",
      icon: Users,
    },
    {
      title: "Usuários Diários",
      value: metrics.dailyActiveUsers,
      description: "Últimas 24 horas",
      icon: TrendingUp,
    },
    {
      title: "Tipos de Eventos",
      value: metrics.topEvents.length,
      description: "Diferentes eventos",
      icon: BarChart3,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};