
import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AudioListNew } from '@/components/admin/AudioListNew';

export const AdminAudiosPageNew: React.FC = () => {
  return (
    <AdminLayout title="Gerenciar Áudios">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Biblioteca de Áudios</h2>
          <p className="text-muted-foreground">
            Gerencie todos os áudios disponíveis na plataforma
          </p>
        </div>
        
        <AudioListNew />
      </div>
    </AdminLayout>
  );
};

export default AdminAudiosPageNew;
