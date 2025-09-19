
/**
 * Favorite Button - Componente para adicionar áudios à playlist
 * Responsabilidade: UI para adicionar à playlist
 * Princípio SRP: Apenas botão de playlist
 * Princípio DRY: Componente reutilizável
 * OTIMIZADO: React.memo para evitar re-renders desnecessários
 */

import React, { useState, useCallback } from 'react';
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

const FavoriteButtonComponent = ({ 
  audioId,
  audioTitle,
  size = 'default', 
  variant = 'ghost' 
}: FavoriteButtonProps) => {
  const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { playlists, createPlaylist, addAudioToPlaylist, removeAudioFromPlaylist } = usePlaylistManager();
  const { 
    favoriteStatus, 
    forceRefresh,
    setOptimisticFavoriteStatus,
    clearOptimisticStatus
  } = useFavorites(audioId);
  const { toast } = useToast();

  const handleToggleFavorite = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    // UI OTIMISTA: Atualiza imediatamente antes da operação
    const willBeFavorite = !favoriteStatus.isFavorite;
    setOptimisticFavoriteStatus(willBeFavorite);
    
    try {
      // Se já é favorito, remove da playlist atual
      if (favoriteStatus.isFavorite && favoriteStatus.playlistId) {
        const success = removeAudioFromPlaylist(favoriteStatus.playlistId, audioId);
        if (success) {
          toast({
            title: "Removido da playlist",
            description: `"${audioTitle}" foi removido da playlist "${favoriteStatus.playlistName}"`,
          });
        } else {
          // Reverte otimismo se falhou
          setOptimisticFavoriteStatus(!willBeFavorite);
          toast({
            title: "Erro",
            description: "Não foi possível remover da playlist",
            variant: "destructive",
          });
        }
        forceRefresh();
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
        } else {
          // Reverte otimismo se falhou
          setOptimisticFavoriteStatus(!willBeFavorite);
          toast({
            title: "Erro",
            description: "Não foi possível adicionar à playlist",
            variant: "destructive",
          });
        }
        forceRefresh();
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
          // Reverte otimismo se falhou
          setOptimisticFavoriteStatus(!willBeFavorite);
          toast({
            title: "Áudio já está na playlist",
            description: `"${audioTitle}" já está na playlist "${playlists[0].name}"`,
            variant: "destructive",
          });
        }
        forceRefresh();
      }
      // Se tem múltiplas playlists, mostra o diálogo de seleção
      else {
        clearOptimisticStatus(); // Remove otimismo pois vai mostrar diálogo
        setShowPlaylistDialog(true);
      }
    } catch (error) {
      // Reverte otimismo em caso de erro
      setOptimisticFavoriteStatus(!willBeFavorite);
      toast({
        title: "Erro",
        description: "Erro ao adicionar à playlist",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    isLoading,
    favoriteStatus.isFavorite,
    favoriteStatus.playlistId,
    favoriteStatus.playlistName,
    playlists.length,
    setOptimisticFavoriteStatus,
    clearOptimisticStatus,
    removeAudioFromPlaylist,
    audioId,
    toast,
    audioTitle,
    forceRefresh,
    createPlaylist,
    addAudioToPlaylist,
    playlists
  ]);

  const handlePlaylistDialogSuccess = useCallback(() => {
    forceRefresh();
    setShowPlaylistDialog(false);
  }, [forceRefresh]);

  const handleOpenChange = useCallback((open: boolean) => {
    setShowPlaylistDialog(open);
  }, []);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleToggleFavorite}
        disabled={isLoading}
        aria-pressed={favoriteStatus.isFavorite}
        className={cn(
          "hover-scale transition-all duration-200",
          isLoading && "opacity-60 cursor-not-allowed"
        )}
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
        onOpenChange={handleOpenChange}
        onSuccess={handlePlaylistDialogSuccess}
      />
    </>
  );
};

// Otimização com React.memo para evitar re-renders desnecessários
export const FavoriteButton = React.memo(FavoriteButtonComponent, (prevProps, nextProps) => {
  return (
    prevProps.audioId === nextProps.audioId &&
    prevProps.audioTitle === nextProps.audioTitle &&
    prevProps.size === nextProps.size &&
    prevProps.variant === nextProps.variant
  );
});

FavoriteButton.displayName = 'FavoriteButton';
