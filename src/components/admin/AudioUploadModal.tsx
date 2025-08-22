
/**
 * Audio Upload Modal - Modal para upload de áudios
 * Responsabilidade: Interface modal para upload de áudios
 * Princípio SRP: Apenas modal de upload
 * Princípio DRY: Modal reutilizável
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AudioUploadForm } from './AudioUploadForm';
import { useAudioUpload } from '@/hooks/useAudioUpload';
import { AudioWithFile } from '@/services/supabase/audioService';
import { Field } from '@/services/supabase/fieldService';

interface AudioUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  fields: Field[];
  onSuccess?: () => void;
}

export const AudioUploadModal = ({ 
  isOpen, 
  onClose, 
  fields, 
  onSuccess 
}: AudioUploadModalProps) => {
  const { loading, errors, uploadAudio, resetErrors } = useAudioUpload();

  const handleSubmit = async (audioData: AudioWithFile) => {
    const success = await uploadAudio(audioData);
    if (success) {
      onClose();
      onSuccess?.();
      resetErrors();
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      resetErrors();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Áudio</DialogTitle>
        </DialogHeader>
        
        <AudioUploadForm
          fields={fields}
          onSubmit={handleSubmit}
          onCancel={handleClose}
          isLoading={loading}
          errors={errors}
        />
      </DialogContent>
    </Dialog>
  );
};
