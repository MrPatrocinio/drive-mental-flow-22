
import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { FieldListNew } from '@/components/admin/FieldListNew';

export const AdminFieldsPageNew: React.FC = () => {
  return (
    <AdminLayout title="Gerenciar Campos">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Campos de Desenvolvimento</h2>
          <p className="text-muted-foreground">
            Gerencie os campos disponíveis na plataforma
          </p>
        </div>
        
        <FieldListNew />
      </div>
    </AdminLayout>
  );
};

export default AdminFieldsPageNew;
