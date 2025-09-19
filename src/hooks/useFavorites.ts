
/**
 * Favorites Hook - Hook para gerenciamento de favoritos
 * Responsabilidade: Estado e lógica de favoritos
 * Princípio SRP: Apenas gerenciamento de favoritos
 * Princípio SSOT: Fonte única da verdade para favoritos
 * SIMPLIFICADO: Depende apenas do estado reativo
 */

import { useState, useCallback, useEffect } from 'react';
import { usePlaylistManager } from './usePlaylistManager';

export interface FavoriteStatus {
  isFavorite: boolean;
  playlistId: string | null;
  playlistName: string | null;
}

interface OptimisticStatus {
  isFavorite: boolean;
  timestamp: number;
}

export function useFavorites(audioId: string) {
  const { playlists, refreshPlaylists } = usePlaylistManager();
  const [favoriteStatus, setFavoriteStatus] = useState<FavoriteStatus>({
    isFavorite: false,
    playlistId: null,
    playlistName: null
  });
  const [optimisticStatus, setOptimisticStatus] = useState<OptimisticStatus | null>(null);

  /**
   * Verifica se o áudio está em alguma playlist
   * Responsabilidade: Única verificação baseada no estado reativo
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
   * Define status otimista para feedback imediato
   */
  const setOptimisticFavoriteStatus = useCallback((isFavorite: boolean) => {
    setOptimisticStatus({
      isFavorite,
      timestamp: Date.now()
    });
    
    // Limpa automaticamente após 3 segundos (fallback de segurança)
    setTimeout(() => {
      setOptimisticStatus(null);
    }, 3000);
  }, []);

  /**
   * Limpa status otimista
   */
  const clearOptimisticStatus = useCallback(() => {
    setOptimisticStatus(null);
  }, []);

  /**
   * Força refresh imediato
   * Responsabilidade: Garantir sincronização imediata após operações
   */
  const forceRefresh = useCallback(() => {
    clearOptimisticStatus();
    refreshPlaylists();
  }, [refreshPlaylists, clearOptimisticStatus]);

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

  // Status final com prioridade para otimista
  const finalStatus: FavoriteStatus = optimisticStatus 
    ? { ...favoriteStatus, isFavorite: optimisticStatus.isFavorite }
    : favoriteStatus;

  return {
    favoriteStatus: finalStatus,
    isInPlaylist,
    getPlaylistsContainingAudio,
    refreshFavoriteStatus: checkFavoriteStatus,
    forceRefresh,
    setOptimisticFavoriteStatus,
    clearOptimisticStatus
  };
}
