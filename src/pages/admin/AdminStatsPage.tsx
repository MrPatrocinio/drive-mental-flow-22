
/**
 * Admin Stats Page
 * Responsabilidade: Página administrativa para estatísticas
 * Princípio SRP: Apenas layout da página administrativa
 */

import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatsCard } from '@/components/admin/stats/StatsCard';
import { UserGrowthChart } from '@/components/admin/stats/UserGrowthChart';
import { TopAudiosChart } from '@/components/admin/stats/TopAudiosChart';
import { FieldStatsChart } from '@/components/admin/stats/FieldStatsChart';
import { UsageTimeChart } from '@/components/admin/stats/UsageTimeChart';
import { ActiveUsersChart } from '@/components/admin/stats/ActiveUsersChart';
import { PlatformUsageChart } from '@/components/admin/stats/PlatformUsageChart';
import { AudioUsageTable } from '@/components/admin/stats/AudioUsageTable';

const AdminStatsPage = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Estatísticas e Métricas</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UserGrowthChart />
          <ActiveUsersChart />
          <TopAudiosChart />
          <FieldStatsChart />
          <UsageTimeChart />
          <PlatformUsageChart />
        </div>
        
        <div className="mt-8">
          <AudioUsageTable />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminStatsPage;
