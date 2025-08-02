/**
 * Favorites Hook - Hook para gerenciamento de favoritos
 * Responsabilidade: Estado e lógica de favoritos
 * Princípio SRP: Apenas gerenciamento de favoritos
 * Princípio SSOT: Fonte única da verdade para favoritos
 */

import { useState, useCallback, useEffect } from 'react';
import { usePlaylistManager } from './usePlaylistManager';

export interface FavoriteStatus {
  isFavorite: boolean;
  playlistId: string | null;
  playlistName: string | null;
}

export function useFavorites(audioId: string) {
  const { playlists } = usePlaylistManager();
  const [favoriteStatus, setFavoriteStatus] = useState<FavoriteStatus>({
    isFavorite: false,
    playlistId: null,
    playlistName: null
  });

  /**
   * Verifica se o áudio está em alguma playlist (é favorito)
   */
  const checkFavoriteStatus = useCallback(() => {
    for (const playlist of playlists) {
      const audioExists = playlist.audios.some(audio => audio.id === audioId);
      if (audioExists) {
        setFavoriteStatus({
          isFavorite: true,
          playlistId: playlist.id,
          playlistName: playlist.name
        });
        return;
      }
    }
    
    // Se não encontrou em nenhuma playlist
    setFavoriteStatus({
      isFavorite: false,
      playlistId: null,
      playlistName: null
    });
  }, [playlists, audioId]);

  /**
   * Verifica se o áudio está numa playlist específica
   */
  const isInPlaylist = useCallback((playlistId: string): boolean => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return false;
    return playlist.audios.some(audio => audio.id === audioId);
  }, [playlists, audioId]);

  /**
   * Retorna todas as playlists que contêm este áudio
   */
  const getPlaylistsContainingAudio = useCallback(() => {
    return playlists.filter(playlist => 
      playlist.audios.some(audio => audio.id === audioId)
    );
  }, [playlists, audioId]);

  // Atualiza o status quando as playlists ou audioId mudam
  useEffect(() => {
    checkFavoriteStatus();
  }, [checkFavoriteStatus]);

  return {
    favoriteStatus,
    isInPlaylist,
    getPlaylistsContainingAudio,
    refreshFavoriteStatus: checkFavoriteStatus
  };
}