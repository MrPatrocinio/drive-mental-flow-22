export interface PlaylistAudio {
  id: string;
  title: string;
  description: string;
  duration: string;
  fieldId: string;
  fieldTitle: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  audios: PlaylistAudio[];
  createdAt: Date;
  updatedAt: Date;
}

export class PlaylistService {
  private static readonly STORAGE_KEY = 'user_playlists';

  static getPlaylists(): Playlist[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return [];
    
    return JSON.parse(stored).map((playlist: any) => ({
      ...playlist,
      createdAt: new Date(playlist.createdAt),
      updatedAt: new Date(playlist.updatedAt)
    }));
  }

  static savePlaylists(playlists: Playlist[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(playlists));
  }

  static createPlaylist(name: string, description: string = ''): Playlist {
    const newPlaylist: Playlist = {
      id: `playlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      audios: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const playlists = this.getPlaylists();
    playlists.push(newPlaylist);
    this.savePlaylists(playlists);

    return newPlaylist;
  }

  static updatePlaylist(id: string, updates: Partial<Omit<Playlist, 'id' | 'createdAt'>>): Playlist | null {
    const playlists = this.getPlaylists();
    const index = playlists.findIndex(p => p.id === id);
    
    if (index === -1) return null;

    playlists[index] = {
      ...playlists[index],
      ...updates,
      updatedAt: new Date()
    };

    this.savePlaylists(playlists);
    return playlists[index];
  }

  static deletePlaylist(id: string): boolean {
    const playlists = this.getPlaylists();
    const filtered = playlists.filter(p => p.id !== id);
    
    if (filtered.length === playlists.length) return false;

    this.savePlaylists(filtered);
    return true;
  }

  static addAudioToPlaylist(playlistId: string, audio: PlaylistAudio): boolean {
    const playlists = this.getPlaylists();
    const playlist = playlists.find(p => p.id === playlistId);
    
    if (!playlist) return false;

    // Evitar duplicatas
    const exists = playlist.audios.some(a => a.id === audio.id);
    if (exists) return false;

    playlist.audios.push(audio);
    playlist.updatedAt = new Date();
    
    this.savePlaylists(playlists);
    return true;
  }

  static removeAudioFromPlaylist(playlistId: string, audioId: string): boolean {
    const playlists = this.getPlaylists();
    const playlist = playlists.find(p => p.id === playlistId);
    
    if (!playlist) return false;

    const initialLength = playlist.audios.length;
    playlist.audios = playlist.audios.filter(a => a.id !== audioId);
    
    if (playlist.audios.length === initialLength) return false;

    playlist.updatedAt = new Date();
    this.savePlaylists(playlists);
    return true;
  }

  static getPlaylistById(id: string): Playlist | null {
    return this.getPlaylists().find(p => p.id === id) || null;
  }
}