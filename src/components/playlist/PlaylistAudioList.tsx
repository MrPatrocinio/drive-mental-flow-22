import { useState } from "react";
import { PlaylistAudioItem } from "./PlaylistAudioItem";
import { PlaylistAudio } from "@/services/playlistService";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface PlaylistAudioListProps {
  audios: PlaylistAudio[];
  onRemoveAudio: (audioId: string) => Promise<void>;
  isLoading?: boolean;
}

export function PlaylistAudioList({ audios, onRemoveAudio, isLoading = false }: PlaylistAudioListProps) {
  const [audioToRemove, setAudioToRemove] = useState<PlaylistAudio | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemoveClick = (audioId: string) => {
    const audio = audios.find(a => a.id === audioId);
    if (audio) {
      setAudioToRemove(audio);
    }
  };

  const confirmRemove = async () => {
    if (!audioToRemove) return;

    setIsRemoving(true);
    
    try {
      await onRemoveAudio(audioToRemove.id);
      setAudioToRemove(null);
    } catch (error) {
      // O erro será tratado pelo componente pai
    } finally {
      setIsRemoving(false);
    }
  };

  const cancelRemove = () => {
    setAudioToRemove(null);
  };

  if (audios.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Esta playlist não contém áudios ainda.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {audios.map((audio) => (
          <PlaylistAudioItem
            key={audio.id}
            audio={audio}
            onRemove={handleRemoveClick}
            isRemoving={isLoading || isRemoving}
          />
        ))}
      </div>

      {/* Dialog de confirmação */}
      <AlertDialog open={!!audioToRemove} onOpenChange={cancelRemove}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Áudio</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o áudio "{audioToRemove?.title}" desta playlist?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmRemove}
              disabled={isRemoving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemoving ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}