import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserPlus, Clock } from "lucide-react";
import { UserStats } from "@/services/supabase/userManagementService";

interface UserStatsCardsProps {
  stats: UserStats | null;
  loading: boolean;
}

/**
 * Componente para exibir cards de estatísticas de usuários
 * Responsabilidade: Apresentação visual das métricas principais
 */
export const UserStatsCards = ({ stats, loading }: UserStatsCardsProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded mb-2" />
              <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      title: "Total de Usuários",
      value: stats.totalUsers,
      icon: Users,
      description: "Usuários cadastrados",
    },
    {
      title: "Assinantes",
      value: stats.totalSubscribers,
      icon: UserCheck,
      description: "Usuários com assinatura",
    },
    {
      title: "Novos Usuários",
      value: stats.recentSignups,
      icon: UserPlus,
      description: "Últimos 7 dias",
    },
    {
      title: "Assinaturas Ativas",
      value: stats.activeSubscriptions,
      icon: Clock,
      description: "Não expiradas",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map(({ title, value, icon: Icon, description }) => (
        <Card key={title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};