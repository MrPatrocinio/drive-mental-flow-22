
import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { LandingContentForm } from '@/components/admin/LandingContentForm';

export const AdminLandingPage: React.FC = () => {
  return (
    <AdminLayout title="Conteúdo da Landing Page">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Editar Conteúdo da Landing Page</h2>
          <p className="text-muted-foreground">
            Gerencie o conteúdo principal da página inicial
          </p>
        </div>
        
        <LandingContentForm />
      </div>
    </AdminLayout>
  );
};

export default AdminLandingPage;
