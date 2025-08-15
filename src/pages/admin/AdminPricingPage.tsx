
/**
 * Admin Pricing Page
 * Responsabilidade: Página administrativa para preços
 * Princípio SRP: Apenas layout da página administrativa
 */

import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { PricingForm } from '@/components/admin/pricing/PricingForm';
import { PricingPreview } from '@/components/admin/pricing/PricingPreview';
import { PricingStats } from '@/components/admin/pricing/PricingStats';
import { PricingSyncStatus } from '@/components/admin/pricing/PricingSyncStatus';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminPricingPage = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Gerenciamento de Preços</h1>
          <PricingSyncStatus />
        </div>
        
        <Tabs defaultValue="form" className="w-full">
          <TabsList>
            <TabsTrigger value="form">Configurar</TabsTrigger>
            <TabsTrigger value="preview">Visualizar</TabsTrigger>
            <TabsTrigger value="stats">Estatísticas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="form">
            <PricingForm />
          </TabsContent>
          
          <TabsContent value="preview">
            <PricingPreview />
          </TabsContent>
          
          <TabsContent value="stats">
            <PricingStats />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminPricingPage;
