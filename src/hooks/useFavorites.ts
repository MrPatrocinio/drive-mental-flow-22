/**
 * Favorites Hook - Hook para gerenciamento de favoritos
 * Responsabilidade: Estado e lógica de favoritos
 * Princípio SRP: Apenas gerenciamento de favoritos
 * Princípio SSOT: Fonte única da verdade para favoritos
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { usePlaylistManager } from './usePlaylistManager';
import { PlaylistService } from '@/services/playlistService';

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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Verifica se o áudio está em alguma playlist diretamente do localStorage
   * Responsabilidade: Verificação síncrona e imediata
   */
  const checkFavoriteStatusFromStorage = useCallback(() => {
    const storedPlaylists = PlaylistService.getPlaylists();
    
    for (const playlist of storedPlaylists) {
      const audioExists = playlist.audios.some(audio => audio.id === audioId);
      if (audioExists) {
        const newStatus = {
          isFavorite: true,
          playlistId: playlist.id,
          playlistName: playlist.name
        };
        setFavoriteStatus(newStatus);
        return newStatus;
      }
    }
    
    const newStatus = {
      isFavorite: false,
      playlistId: null,
      playlistName: null
    };
    setFavoriteStatus(newStatus);
    return newStatus;
  }, [audioId]);

  /**
   * Verifica se o áudio está em alguma playlist (é favorito)
   * Responsabilidade: Verificação baseada no estado reativo
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
   * Força refresh imediato e com fallback
   * Responsabilidade: Garantir sincronização imediata após operações
   */
  const forceRefresh = useCallback(() => {
    // Limpa timeout anterior se existir
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Primeira verificação imediata
    checkFavoriteStatusFromStorage();
    
    // Fallback após pequeno delay para garantir que localStorage foi processado
    timeoutRef.current = setTimeout(() => {
      checkFavoriteStatusFromStorage();
    }, 50);
  }, [checkFavoriteStatusFromStorage]);

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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    favoriteStatus,
    isInPlaylist,
    getPlaylistsContainingAudio,
    refreshFavoriteStatus: checkFavoriteStatus,
    forceRefresh
  };
}