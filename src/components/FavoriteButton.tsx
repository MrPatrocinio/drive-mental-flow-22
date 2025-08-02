/**
 * Favorite Button - Componente para adicionar áudios à playlist
 * Responsabilidade: UI para adicionar à playlist
 * Princípio SRP: Apenas botão de playlist
 * Princípio DRY: Componente reutilizável
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { usePlaylistManager } from '@/hooks/usePlaylistManager';
import { useFavorites } from '@/hooks/useFavorites';
import { useToast } from '@/hooks/use-toast';
import { PlaylistSelectionDialog } from './playlist/PlaylistSelectionDialog';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  audioId: string;
  audioTitle: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'ghost' | 'outline' | 'default';
}

export function FavoriteButton({ 
  audioId,
  audioTitle,
  size = 'default', 
  variant = 'ghost' 
}: FavoriteButtonProps) {
  const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { playlists, createPlaylist, addAudioToPlaylist, removeAudioFromPlaylist } = usePlaylistManager();
  const { favoriteStatus, refreshFavoriteStatus } = useFavorites(audioId);
  const { toast } = useToast();

  const handleToggleFavorite = async () => {
    setIsLoading(true);
    
    try {
      // Se já é favorito, remove da playlist atual
      if (favoriteStatus.isFavorite && favoriteStatus.playlistId) {
        const success = removeAudioFromPlaylist(favoriteStatus.playlistId, audioId);
        if (success) {
          toast({
            title: "Removido da playlist",
            description: `"${audioTitle}" foi removido da playlist "${favoriteStatus.playlistName}"`,
          });
          refreshFavoriteStatus();
        }
        return;
      }

      // Se não é favorito, adiciona à playlist
      // Se não tem playlists, cria automaticamente "Favoritos"
      if (playlists.length === 0) {
        const favoritesPlaylist = createPlaylist("Favoritos", "Seus áudios favoritos");
        const success = addAudioToPlaylist(favoritesPlaylist.id, {
          id: audioId,
          title: audioTitle,
          description: "",
          duration: "0:00",
          fieldId: "",
          fieldTitle: ""
        });

        if (success) {
          toast({
            title: "Adicionado à playlist Favoritos",
            description: `"${audioTitle}" foi adicionado à sua playlist Favoritos`,
          });
          refreshFavoriteStatus();
        }
      } 
      // Se tem apenas uma playlist, adiciona diretamente
      else if (playlists.length === 1) {
        const success = addAudioToPlaylist(playlists[0].id, {
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
            description: `"${audioTitle}" foi adicionado à playlist "${playlists[0].name}"`,
          });
          refreshFavoriteStatus();
        } else {
          toast({
            title: "Áudio já está na playlist",
            description: `"${audioTitle}" já está na playlist "${playlists[0].name}"`,
            variant: "destructive",
          });
        }
      }
      // Se tem múltiplas playlists, mostra o diálogo de seleção
      else {
        setShowPlaylistDialog(true);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar à playlist",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaylistDialogSuccess = () => {
    refreshFavoriteStatus();
    setShowPlaylistDialog(false);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleToggleFavorite}
        disabled={isLoading}
        className="hover-scale transition-all duration-200"
        title={favoriteStatus.isFavorite 
          ? `Remover da playlist "${favoriteStatus.playlistName}"` 
          : "Adicionar à playlist"
        }
      >
        <Heart 
          className={cn(
            "w-4 h-4 transition-colors duration-200",
            favoriteStatus.isFavorite 
              ? "fill-red-500 text-red-500" 
              : "text-muted-foreground hover:text-red-400"
          )} 
        />
      </Button>

      <PlaylistSelectionDialog
        audioId={audioId}
        audioTitle={audioTitle}
        open={showPlaylistDialog}
        onOpenChange={setShowPlaylistDialog}
        onSuccess={handlePlaylistDialogSuccess}
      />
    </>
  );
}