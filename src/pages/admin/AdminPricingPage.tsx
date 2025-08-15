
/**
 * Admin Pricing Page
 * Responsabilidade: Páginas administrativa para preços
 * Princípio SRP: Apenas layout da página administrativa
 */

import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { PricingForm } from '@/components/admin/pricing/PricingForm';
import { PricingPreview } from '@/components/admin/pricing/PricingPreview';
import { PricingStats } from '@/components/admin/pricing/PricingStats';
import { PricingSyncStatus } from '@/components/admin/pricing/PricingSyncStatus';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data para demonstração
const mockPricing = {
  id: '1',
  price: 2990,
  currency: 'BRL',
  payment_type: 'one_time',
  access_type: 'lifetime',
  button_text: 'Assinar Agora',
  benefits: [
    'Acesso completo aos áudios',
    'Qualidade premium',
    'Suporte 24/7'
  ],
  promotion_label: 'Oferta Especial',
  discount_percentage: 20,
  promotion_end_date: '2024-12-31T23:59:59Z',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

const AdminPricingPage = () => {
  const handleSubmit = (data: any) => {
    console.log('Dados submetidos:', data);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Gerenciamento de Preços</h1>
          <PricingSyncStatus pricing={mockPricing} />
        </div>
        
        <Tabs defaultValue="form" className="w-full">
          <TabsList>
            <TabsTrigger value="form">Configurar</TabsTrigger>
            <TabsTrigger value="preview">Visualizar</TabsTrigger>
            <TabsTrigger value="stats">Estatísticas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="form">
            <PricingForm onSubmit={handleSubmit} />
          </TabsContent>
          
          <TabsContent value="preview">
            <PricingPreview pricing={mockPricing} />
          </TabsContent>
          
          <TabsContent value="stats">
            <PricingStats pricingData={mockPricing} />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminPricingPage;
