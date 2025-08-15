import { AdminLayout } from "@/components/admin/AdminLayout";
import { AnalyticsOverview } from "@/components/analytics/AnalyticsOverview";
import { TopEventsChart } from "@/components/analytics/TopEventsChart";

export const AdminAnalyticsPage = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">
            Insights de uso e comportamento dos usuários
          </p>
        </div>
        
        <AnalyticsOverview />
        
        <TopEventsChart />
      </div>
    </AdminLayout>
  );
};