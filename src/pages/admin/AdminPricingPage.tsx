import { AdminLayout } from '@/components/admin/AdminLayout';
import { PricingForm } from '@/components/admin/pricing/PricingForm';
import { BenefitsList } from '@/components/admin/pricing/BenefitsList';
import { PricingPreview } from '@/components/admin/pricing/PricingPreview';
import { PricingStats } from '@/components/admin/pricing/PricingStats';
import { usePricing } from '@/hooks/usePricing';
import { DollarSign } from 'lucide-react';

const AdminPricingPage = () => {
  const {
    pricingData,
    isLoading,
    updatePricing,
    addBenefit,
    removeBenefit,
    updateBenefit,
  } = usePricing();

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <DollarSign className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Gerenciamento de Preços</h1>
            <p className="text-muted-foreground">
              Configure preços e benefícios do seu produto
            </p>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left column - Forms */}
          <div className="space-y-6">
            <PricingForm
              pricingData={pricingData}
              onUpdate={updatePricing}
              isLoading={isLoading}
            />

            <BenefitsList
              benefits={pricingData.benefits}
              onAdd={addBenefit}
              onRemove={removeBenefit}
              onUpdate={updateBenefit}
              isLoading={isLoading}
            />
          </div>

          {/* Right column - Preview and Stats */}
          <div className="space-y-6">
            <PricingStats pricingData={pricingData} />
            <PricingPreview pricingData={pricingData} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPricingPage;