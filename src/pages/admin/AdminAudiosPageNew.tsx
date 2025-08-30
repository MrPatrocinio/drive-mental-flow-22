
import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AudioList } from '@/components/admin/AudioListNew';
import { AudioUploadModal } from '@/components/admin/AudioUploadModal';
import { AudioEditModal } from '@/components/admin/AudioEditModal';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/contexts/AdminContext';
import { Plus } from 'lucide-react';
import { Audio } from '@/services/supabase/audioService';
import { useToast } from '@/hooks/use-toast';

export const AdminAudiosPageNew: React.FC = () => {
  const { audios, fields, updateAudio, deleteAudio, refreshData } = useAdmin();
  const { toast } = useToast();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [audioBeingEdited, setAudioBeingEdited] = useState<Audio | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editErrors, setEditErrors] = useState<string[]>([]);

  const handleEdit = (audio: Audio) => {
    setAudioBeingEdited(audio);
    setShowEditModal(true);
    setEditErrors([]);
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

  const handleEditSubmit = async (audioData: any, file?: File) => {
    if (!audioBeingEdited) return;

    setIsEditing(true);
    setEditErrors([]);

    try {
      const updateData = {
        title: audioData.title,
        duration: audioData.duration,
        field_id: audioData.field_id,
      };

      await updateAudio({ ...audioBeingEdited, ...updateData });
      
      toast({
        title: "Áudio atualizado",
        description: "O áudio foi atualizado com sucesso.",
      });
      
      setShowEditModal(false);
      setAudioBeingEdited(null);
      refreshData();
    } catch (error) {
      console.error('Erro ao atualizar áudio:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o áudio. Tente novamente.",
        variant: "destructive",
      });
      setEditErrors(['Erro ao atualizar áudio']);
    } finally {
      setIsEditing(false);
    }
  };

  const handleEditModalClose = () => {
    if (!isEditing) {
      setShowEditModal(false);
      setAudioBeingEdited(null);
      setEditErrors([]);
    }
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

        <AudioEditModal
          isOpen={showEditModal}
          onClose={handleEditModalClose}
          audio={audioBeingEdited}
          fields={fields}
          onSubmit={handleEditSubmit}
          isLoading={isEditing}
          errors={editErrors}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminAudiosPageNew;
