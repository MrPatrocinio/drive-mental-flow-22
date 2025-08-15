
/**
 * Admin Validation Page
 * Responsabilidade: Página administrativa para validação do sistema
 * Princípio SRP: Apenas layout da página administrativa
 */

import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { SystemValidationPanel } from '@/components/admin/SystemValidationPanel';

const AdminValidationPage = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Validação do Sistema</h1>
        <SystemValidationPanel />
      </div>
    </AdminLayout>
  );
};

export default AdminValidationPage;
