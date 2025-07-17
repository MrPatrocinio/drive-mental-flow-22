import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatsCard } from "@/components/admin/stats/StatsCard";
import { FieldStatsChart } from "@/components/admin/stats/FieldStatsChart";
import { UserGrowthChart } from "@/components/admin/stats/UserGrowthChart";
import { AudioUsageTable } from "@/components/admin/stats/AudioUsageTable";
import { ActiveUsersChart } from "@/components/admin/stats/ActiveUsersChart";
import { UsageTimeChart } from "@/components/admin/stats/UsageTimeChart";
import { TopAudiosChart } from "@/components/admin/stats/TopAudiosChart";
import { PlatformUsageChart } from "@/components/admin/stats/PlatformUsageChart";
import { StatsService, StatsData } from "@/services/statsService";
import { Users, Music, FolderOpen, Clock, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const AdminStatsPage = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Simula carregamento para melhor UX
        await new Promise(resolve => setTimeout(resolve, 800));
        const statsData = StatsService.getAllStats();
        setStats(statsData);
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <AdminLayout title="Estatísticas">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </AdminLayout>
    );
  }

  if (!stats) {
    return (
      <AdminLayout title="Estatísticas">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Erro ao carregar estatísticas</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Estatísticas">
      <div className="space-y-6">
        {/* Cards de estatísticas gerais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total de Usuários"
            value={stats.totalUsers.toLocaleString()}
            icon={Users}
            description="Usuários cadastrados"
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Total de Áudios"
            value={stats.totalAudios}
            icon={Music}
            description="Áudios disponíveis"
          />
          <StatsCard
            title="Campos Ativos"
            value={stats.totalFields}
            icon={FolderOpen}
            description="Categorias de conteúdo"
          />
          <StatsCard
            title="Tempo Total"
            value={stats.totalPlaytime}
            icon={Clock}
            description="Duração dos áudios"
          />
        </div>

        {/* Campo mais popular */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <StatsCard
            title="Campo Mais Popular"
            value={stats.mostPopularField.fieldName}
            icon={TrendingUp}
            description={`${stats.mostPopularField.audioCount} áudios (${stats.mostPopularField.usagePercentage.toFixed(1)}%)`}
          />
        </div>

        {/* Gráficos principais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FieldStatsChart data={stats.audiosByField} />
          <UserGrowthChart data={stats.userGrowth} />
        </div>

        {/* Gráficos de análise detalhada */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActiveUsersChart data={stats.activeUsers} />
          <UsageTimeChart data={stats.usageByTime} />
        </div>

        {/* Gráficos de conteúdo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopAudiosChart data={stats.topAudios} />
          <PlatformUsageChart data={stats.platformUsage} />
        </div>

        {/* Tabela de áudios mais ouvidos */}
        <AudioUsageTable data={stats.audioUsage} />
      </div>
    </AdminLayout>
  );
};