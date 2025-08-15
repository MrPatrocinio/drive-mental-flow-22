
/**
 * Admin Analytics Page
 * Responsabilidade: Página administrativa para analytics
 * Princípio SRP: Apenas layout da página administrativa
 */

import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AnalyticsOverview } from '@/components/analytics/AnalyticsOverview';
import { TopEventsChart } from '@/components/analytics/TopEventsChart';

const AdminAnalyticsPage = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Analytics e Comportamento</h1>
        
        <AnalyticsOverview />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopEventsChart />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalyticsPage;
