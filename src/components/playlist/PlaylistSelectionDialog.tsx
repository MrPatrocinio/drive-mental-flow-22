/**
 * Playlist Selection Dialog - Componente para seleção de playlist
 * Responsabilidade: UI para seleção de playlist
 * Princípio SRP: Apenas seleção de playlist
 * Princípio DRY: Componente reutilizável
 */

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePlaylistManager } from "@/hooks/usePlaylistManager";
import { useToast } from "@/hooks/use-toast";
import { Music } from "lucide-react";

interface PlaylistSelectionDialogProps {
  audioId: string;
  audioTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PlaylistSelectionDialog({
  audioId,
  audioTitle,
  open,
  onOpenChange
}: PlaylistSelectionDialogProps) {
  const [isAdding, setIsAdding] = useState(false);
  const { playlists, addAudioToPlaylist } = usePlaylistManager();
  const { toast } = useToast();

  const handleAddToPlaylist = async (playlistId: string, playlistName: string) => {
    setIsAdding(true);
    
    try {
      const success = addAudioToPlaylist(playlistId, {
        id: audioId,
        title: audioTitle,
        description: "",
        duration: "0:00",
        fieldId: "",
        fieldTitle: ""
      });

      if (success) {
        toast({
          title: "Adicionado à playlist",
          description: `"${audioTitle}" foi adicionado à playlist "${playlistName}"`,
        });
        onOpenChange(false);
      } else {
        toast({
          title: "Áudio já está na playlist",
          description: `"${audioTitle}" já está na playlist "${playlistName}"`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar à playlist",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Selecionar Playlist</DialogTitle>
          <DialogDescription>
            Escolha uma playlist para adicionar "{audioTitle}"
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[300px]">
          <div className="space-y-2">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Music className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{playlist.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {playlist.audios.length} áudio{playlist.audios.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                
                <Button
                  size="sm"
                  onClick={() => handleAddToPlaylist(playlist.id, playlist.name)}
                  disabled={isAdding}
                >
                  Adicionar
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}