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
import { useToast } from '@/hooks/use-toast';
import { PlaylistSelectionDialog } from './playlist/PlaylistSelectionDialog';

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
  const { playlists, createPlaylist, addAudioToPlaylist } = usePlaylistManager();
  const { toast } = useToast();

  const handleAddToPlaylist = async () => {
    setIsLoading(true);
    
    try {
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

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleAddToPlaylist}
        disabled={isLoading}
        className="hover-scale"
        title="Adicionar à playlist"
      >
        <Heart className="w-4 h-4 text-muted-foreground" />
      </Button>

      <PlaylistSelectionDialog
        audioId={audioId}
        audioTitle={audioTitle}
        open={showPlaylistDialog}
        onOpenChange={setShowPlaylistDialog}
      />
    </>
  );
}