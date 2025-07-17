import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlaylistForm } from "./PlaylistForm";
import { PlaylistAudioList } from "./PlaylistAudioList";
import { Playlist } from "@/services/playlistService";
import { usePlaylistManager } from "@/hooks/usePlaylistManager";
import { useToast } from "@/hooks/use-toast";

interface EditPlaylistDialogProps {
  playlist: Playlist | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlaylistUpdated: () => void;
}

export function EditPlaylistDialog({ 
  playlist, 
  open, 
  onOpenChange, 
  onPlaylistUpdated 
}: EditPlaylistDialogProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { updatePlaylist, removeAudioFromPlaylist } = usePlaylistManager();
  const { toast } = useToast();

  const handleUpdate = async (data: { name: string; description: string }) => {
    if (!playlist) return;

    setIsUpdating(true);
    
    try {
      const updatedPlaylist = updatePlaylist(playlist.id, {
        name: data.name,
        description: data.description
      });

      if (updatedPlaylist) {
        toast({
          title: "Playlist atualizada!",
          description: `A playlist "${data.name}" foi atualizada com sucesso.`
        });

        onOpenChange(false);
        onPlaylistUpdated();
      } else {
        throw new Error("Falha ao atualizar playlist");
      }
    } catch (error) {
      toast({
        title: "Erro ao atualizar playlist",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveAudio = async (audioId: string) => {
    if (!playlist) return;

    try {
      const success = removeAudioFromPlaylist(playlist.id, audioId);
      
      if (success) {
        toast({
          title: "Áudio removido",
          description: "O áudio foi removido da playlist com sucesso."
        });
        onPlaylistUpdated();
      } else {
        throw new Error("Falha ao remover áudio");
      }
    } catch (error) {
      toast({
        title: "Erro ao remover áudio",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!playlist) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Editar Playlist</DialogTitle>
          <DialogDescription>
            Altere as informações da sua playlist e gerencie seus áudios
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="audios">
              Áudios ({playlist.audios.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="space-y-4">
            <PlaylistForm
              initialData={{
                name: playlist.name,
                description: playlist.description
              }}
              onSubmit={handleUpdate}
              onCancel={handleCancel}
              submitLabel="Salvar Alterações"
              isLoading={isUpdating}
            />
          </TabsContent>
          
          <TabsContent value="audios" className="space-y-4">
            <div className="pt-4">
              <h3 className="font-medium mb-3">Áudios da Playlist</h3>
              <PlaylistAudioList
                audios={playlist.audios}
                onRemoveAudio={handleRemoveAudio}
                isLoading={isUpdating}
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}