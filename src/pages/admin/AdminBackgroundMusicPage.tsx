
/**
 * Admin Background Music Page
 * Responsabilidade: Página administrativa para música de fundo
 * Princípio SRP: Apenas layout da página administrativa
 */

import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { BackgroundMusicList } from '@/components/admin/BackgroundMusicList';

const AdminBackgroundMusicPage = () => {
  return (
    <AdminLayout>
      <BackgroundMusicList />
    </AdminLayout>
  );
};

export default AdminBackgroundMusicPage;
