
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
import { Users, Music, Headphones, TrendingUp } from 'lucide-react';

// Mock data para demonstração
const mockStatsCards = [
  { title: 'Total de Usuários', value: '1,234', icon: Users, description: 'usuários ativos' },
  { title: 'Total de Áudios', value: '456', icon: Music, description: 'áudios disponíveis' },
  { title: 'Reproduções Hoje', value: '789', icon: Headphones, description: 'reproduções hoje' },
  { title: 'Crescimento', value: '+12%', icon: TrendingUp, description: 'vs mês anterior' }
];

const mockGrowthData = [
  { month: 'Jan', users: 100, sessions: 250 },
  { month: 'Feb', users: 150, sessions: 380 },
  { month: 'Mar', users: 200, sessions: 520 },
  { month: 'Apr', users: 280, sessions: 720 }
];

const mockActiveUsers = [
  { period: 'Hoje', count: 125, color: '#8B5CF6' },
  { period: 'Esta semana', count: 450, color: '#06B6D4' },
  { period: 'Este mês', count: 1200, color: '#10B981' }
];

const mockTopAudios = [
  { title: 'Meditação Relaxante', shortTitle: 'Meditação...', plays: 1250, field: 'Relaxamento' },
  { title: 'Foco Mental', shortTitle: 'Foco...', plays: 980, field: 'Concentração' },
  { title: 'Sleep Stories', shortTitle: 'Sleep...', plays: 750, field: 'Sono' }
];

const mockFieldStats = [
  { fieldName: 'Relaxamento', audioCount: 25, totalDuration: 180 },
  { fieldName: 'Concentração', audioCount: 18, totalDuration: 120 },
  { fieldName: 'Sono', audioCount: 15, totalDuration: 200 }
];

const mockUsageTime = [
  { hour: '00', minutes: 45, sessions: 12 },
  { hour: '06', minutes: 120, sessions: 35 },
  { hour: '12', minutes: 200, sessions: 58 },
  { hour: '18', minutes: 180, sessions: 42 },
  { hour: '21', minutes: 250, sessions: 65 }
];

const mockPlatformUsage = [
  { name: 'Desktop', value: 45, color: '#8B5CF6' },
  { name: 'Mobile', value: 35, color: '#06B6D4' },
  { name: 'Tablet', value: 20, color: '#10B981' }
];

const mockAudioUsage = [
  { audioId: '1', title: 'Meditação Matinal', field: 'Relaxamento', duration: '15:30', plays: 1250 },
  { audioId: '2', title: 'Foco no Trabalho', field: 'Concentração', duration: '20:00', plays: 980 },
  { audioId: '3', title: 'Sono Profundo', field: 'Sono', duration: '30:45', plays: 750 }
];

const AdminStatsPage = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Estatísticas e Métricas</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {mockStatsCards.map((stat, index) => (
            <StatsCard 
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              description={stat.description}
            />
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UserGrowthChart data={mockGrowthData} />
          <ActiveUsersChart data={mockActiveUsers} />
          <TopAudiosChart data={mockTopAudios} />
          <FieldStatsChart data={mockFieldStats} />
          <UsageTimeChart data={mockUsageTime} />
          <PlatformUsageChart data={mockPlatformUsage} />
        </div>
        
        <div className="mt-8">
          <AudioUsageTable data={mockAudioUsage} />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminStatsPage;
