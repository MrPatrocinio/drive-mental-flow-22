import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Playlist, PlaylistAudio } from "@/services/playlistService";
import { usePlaylistManager } from "@/hooks/usePlaylistManager";
import { useToast } from "@/hooks/use-toast";
import { Music, Plus } from "lucide-react";

interface AddToPlaylistDialogProps {
  audio: PlaylistAudio;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddToPlaylistDialog({ audio, open, onOpenChange, onSuccess }: AddToPlaylistDialogProps) {
  const { playlists, addAudioToPlaylist } = usePlaylistManager();
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAddToPlaylist = async (playlist: Playlist) => {
    setIsAdding(playlist.id);

    try {
      const success = addAudioToPlaylist(playlist.id, audio);
      
      if (success) {
        toast({
          title: "Áudio adicionado!",
          description: `"${audio.title}" foi adicionado à playlist "${playlist.name}".`
        });
        onSuccess?.(); // Chama o callback de sucesso se fornecido
      } else {
        toast({
          title: "Áudio já existe",
          description: `Este áudio já está na playlist "${playlist.name}".`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao adicionar",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    } finally {
      setIsAdding(null);
    }
  };

  const isAudioInPlaylist = (playlist: Playlist) => {
    return playlist.audios.some(a => a.id === audio.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar à Playlist</DialogTitle>
          <DialogDescription>
            Escolha uma playlist para adicionar "{audio.title}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {playlists.length === 0 ? (
            <div className="text-center py-8">
              <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Você ainda não possui playlists
              </p>
              <Button 
                onClick={() => {
                  onOpenChange(false);
                  // Aqui pode implementar a criação de playlist ou redirecionar
                }}
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Playlist
              </Button>
            </div>
          ) : (
            <ScrollArea className="max-h-[300px]">
              <div className="space-y-2">
                {playlists.map((playlist) => {
                  const audioExists = isAudioInPlaylist(playlist);
                  
                  return (
                    <div
                      key={playlist.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium truncate">{playlist.name}</h4>
                          {audioExists && (
                            <Badge variant="secondary" className="text-xs">
                              Já adicionado
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {playlist.audios.length} áudios
                        </p>
                      </div>
                      
                      <Button
                        size="sm"
                        variant={audioExists ? "outline" : "default"}
                        disabled={audioExists || isAdding === playlist.id}
                        onClick={() => handleAddToPlaylist(playlist)}
                      >
                        {isAdding === playlist.id ? (
                          "Adicionando..."
                        ) : audioExists ? (
                          "Já existe"
                        ) : (
                          "Adicionar"
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}