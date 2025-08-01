import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlaylistCard } from "./PlaylistCard";
import { CreatePlaylistDialog } from "./CreatePlaylistDialog";
import { EditPlaylistDialog } from "./EditPlaylistDialog";
import { Playlist } from "@/services/playlistService";
import { usePlaylistManager } from "@/hooks/usePlaylistManager";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export function PlaylistSection() {
  const [playlistToDelete, setPlaylistToDelete] = useState<Playlist | null>(null);
  const [playlistToEdit, setPlaylistToEdit] = useState<Playlist | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { playlists, deletePlaylist, refreshPlaylists } = usePlaylistManager();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handlePlay = (playlist: Playlist) => {
    if (playlist.audios.length === 0) return;
    
    // Navega para o primeiro áudio da playlist
    const firstAudio = playlist.audios[0];
    
    toast({
      title: "Reproduzindo playlist",
      description: `Iniciando reprodução de "${playlist.name}" com ${playlist.audios.length} áudios.`
    });

    // Navega para a página de reprodução do primeiro áudio
    navigate(`/audio/${firstAudio.id}`, {
      state: {
        playlist: playlist,
        currentIndex: 0
      }
    });
  };

  const handleEdit = (playlist: Playlist) => {
    setPlaylistToEdit(playlist);
    setEditDialogOpen(true);
  };

  const handleDelete = (playlist: Playlist) => {
    setPlaylistToDelete(playlist);
  };

  const confirmDelete = () => {
    if (!playlistToDelete) return;

    const success = deletePlaylist(playlistToDelete.id);
    
    if (success) {
      toast({
        title: "Playlist excluída",
        description: `A playlist "${playlistToDelete.name}" foi excluída com sucesso.`
      });
    } else {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a playlist.",
        variant: "destructive"
      });
    }

    setPlaylistToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header da seção */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">
            Suas <span className="text-premium">Playlists</span>
          </h2>
          <p className="text-muted-foreground mt-2">
            Organize seus áudios favoritos em playlists personalizadas
          </p>
        </div>
        <CreatePlaylistDialog onPlaylistCreated={refreshPlaylists} />
      </div>

      {/* Grid de playlists */}
      {playlists.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist, index) => (
            <div 
              key={playlist.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <PlaylistCard
                playlist={playlist}
                onPlay={handlePlay}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="card-gradient rounded-2xl p-8 max-w-md mx-auto">
            <h3 className="text-xl font-semibold mb-4">
              Crie sua primeira playlist
            </h3>
            <p className="text-muted-foreground mb-6">
              Organize seus áudios favoritos em playlists personalizadas para uma experiência mais organizada
            </p>
            <CreatePlaylistDialog onPlaylistCreated={refreshPlaylists} />
          </div>
        </div>
      )}

      {/* Dialog de edição */}
      <EditPlaylistDialog
        playlist={playlistToEdit}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onPlaylistUpdated={refreshPlaylists}
      />

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={!!playlistToDelete} onOpenChange={() => setPlaylistToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Playlist</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a playlist "{playlistToDelete?.name}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}