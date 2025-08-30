/**
 * Audio Edit Modal - Modal para edição de áudios
 * Responsabilidade: Interface modal para edição de áudios existentes
 * Princípio SRP: Apenas modal de edição
 * Princípio DRY: Reutiliza AudioForm existente
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AudioForm } from './AudioForm';
import { Audio } from '@/services/supabase/audioService';
import { Field } from '@/services/supabase/fieldService';

interface AudioEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  audio: Audio | null;
  fields: Field[];
  onSubmit: (audioData: any, file?: File) => Promise<void>;
  isLoading?: boolean;
  errors?: string[];
}

export const AudioEditModal = ({ 
  isOpen, 
  onClose, 
  audio,
  fields, 
  onSubmit,
  isLoading = false,
  errors
}: AudioEditModalProps) => {
  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!audio) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Áudio</DialogTitle>
        </DialogHeader>
        
        <AudioForm
          audio={audio}
          fields={fields}
          onSubmit={onSubmit}
          onCancel={handleClose}
          isLoading={isLoading}
          errors={errors}
        />
      </DialogContent>
    </Dialog>
  );
};