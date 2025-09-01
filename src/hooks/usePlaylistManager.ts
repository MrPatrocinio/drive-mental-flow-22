
import { useState, useCallback, useEffect } from "react";
import { Playlist, PlaylistService } from "@/services/playlistService";

export function usePlaylistManager() {
  const [playlists, setPlaylists] = useState<Playlist[]>(() => PlaylistService.getPlaylists());

  const refreshPlaylists = useCallback(() => {
    setPlaylists(PlaylistService.getPlaylists());
  }, []);

  const createPlaylist = useCallback((name: string, description?: string) => {
    const newPlaylist = PlaylistService.createPlaylist(name, description);
    refreshPlaylists();
    return newPlaylist;
  }, [refreshPlaylists]);

  const updatePlaylist = useCallback((id: string, updates: Partial<Omit<Playlist, 'id' | 'createdAt'>>) => {
    const updatedPlaylist = PlaylistService.updatePlaylist(id, updates);
    if (updatedPlaylist) {
      refreshPlaylists();
    }
    return updatedPlaylist;
  }, [refreshPlaylists]);

  const deletePlaylist = useCallback((id: string) => {
    const success = PlaylistService.deletePlaylist(id);
    if (success) {
      refreshPlaylists();
    }
    return success;
  }, [refreshPlaylists]);

  const addAudioToPlaylist = useCallback((playlistId: string, audio: any) => {
    const success = PlaylistService.addAudioToPlaylist(playlistId, audio);
    if (success) {
      refreshPlaylists();
    }
    return success;
  }, [refreshPlaylists]);

  const removeAudioFromPlaylist = useCallback((playlistId: string, audioId: string) => {
    const success = PlaylistService.removeAudioFromPlaylist(playlistId, audioId);
    if (success) {
      refreshPlaylists();
    }
    return success;
  }, [refreshPlaylists]);

  // Listener para mudanças no localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'drive_mental_playlists') {
        refreshPlaylists();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshPlaylists]);

  return {
    playlists,
    refreshPlaylists,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addAudioToPlaylist,
    removeAudioFromPlaylist
  };
}
