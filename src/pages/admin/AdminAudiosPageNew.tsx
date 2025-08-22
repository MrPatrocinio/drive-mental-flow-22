
import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AudioList } from '@/components/admin/AudioListNew';
import { AudioUploadModal } from '@/components/admin/AudioUploadModal';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/contexts/AdminContext';
import { Plus } from 'lucide-react';

export const AdminAudiosPageNew: React.FC = () => {
  const { audios, fields, updateAudio, deleteAudio, refreshData } = useAdmin();
  const [showUploadModal, setShowUploadModal] = useState(false);

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

  const handleUploadSuccess = () => {
    // Atualizar lista após upload bem-sucedido
    refreshData();
  };

  return (
    <AdminLayout title="Gerenciar Áudios">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Biblioteca de Áudios</h2>
            <p className="text-muted-foreground">
              Gerencie todos os áudios disponíveis na plataforma
            </p>
          </div>
          
          <Button onClick={() => setShowUploadModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Áudio
          </Button>
        </div>
        
        <AudioList 
          audios={audios}
          fields={fields}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <AudioUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          fields={fields}
          onSuccess={handleUploadSuccess}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminAudiosPageNew;
