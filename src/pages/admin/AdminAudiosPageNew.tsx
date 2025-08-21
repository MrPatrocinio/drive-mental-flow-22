
import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AudioList } from '@/components/admin/AudioListNew';
import { useAdmin } from '@/contexts/AdminContext';

export const AdminAudiosPageNew: React.FC = () => {
  const { audios, fields, updateAudio, deleteAudio } = useAdmin();

  const handleEdit = (audio: any) => {
    // TODO: Implementar modal de edição
    console.log('Edit audio:', audio);
  };

  const handleDelete = async (audioId: string) => {
    try {
      await deleteAudio(audioId);
    } catch (error) {
      console.error('Erro ao deletar áudio:', error);
    }
  };

  return (
    <AdminLayout title="Gerenciar Áudios">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Biblioteca de Áudios</h2>
          <p className="text-muted-foreground">
            Gerencie todos os áudios disponíveis na plataforma
          </p>
        </div>
        
        <AudioList 
          audios={audios}
          fields={fields}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminAudiosPageNew;
