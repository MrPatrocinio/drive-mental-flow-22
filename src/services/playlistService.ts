
/**
 * Playlist Service - Serviço para gerenciamento de playlists
 * Responsabilidade: CRUD de playlists no localStorage
 * Princípio SRP: Apenas operações de playlist
 * Princípio SSOT: Fonte única para dados de playlist
 * OTIMIZADO: Operações performáticas com debounce
 */

import { LocalStoragePerformanceService } from './localStoragePerformanceService';

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  audios: PlaylistAudio[];
  createdAt: string;
  updatedAt: string;
}

export interface PlaylistAudio {
  id: string;
  title: string;
  description: string;
  duration: string;
  fieldId: string;
  fieldTitle: string;
}

export class PlaylistService {
  private static readonly STORAGE_KEY = 'playlists';

  /**
   * Buscar todas as playlists (operação otimizada)
   */
  static getPlaylists(): Playlist[] {
    try {
      const data = LocalStoragePerformanceService.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('PlaylistService: Erro ao buscar playlists:', error);
      return [];
    }
  }

  /**
   * Salvar playlists com debounce para performance
   */
  private static savePlaylists(playlists: Playlist[], immediate = false): void {
    const data = JSON.stringify(playlists);
    
    if (immediate) {
      LocalStoragePerformanceService.setItemImmediate(this.STORAGE_KEY, data);
    } else {
      LocalStoragePerformanceService.setItemDebounced(this.STORAGE_KEY, data);
    }
  }

  /**
   * Criar nova playlist
   */
  static createPlaylist(name: string, description?: string): Playlist {
    const playlists = this.getPlaylists();
    const newPlaylist: Playlist = {
      id: crypto.randomUUID(),
      name,
      description,
      audios: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    playlists.push(newPlaylist);
    this.savePlaylists(playlists, true); // Salva imediatamente para criar
    return newPlaylist;
  }

  /**
   * Atualizar playlist
   */
  static updatePlaylist(id: string, updates: Partial<Omit<Playlist, 'id' | 'createdAt'>>): Playlist | null {
    const playlists = this.getPlaylists();
    const playlistIndex = playlists.findIndex(p => p.id === id);
    
    if (playlistIndex === -1) return null;

    playlists[playlistIndex] = {
      ...playlists[playlistIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.savePlaylists(playlists);
    return playlists[playlistIndex];
  }

  /**
   * Deletar playlist
   */
  static deletePlaylist(id: string): boolean {
    const playlists = this.getPlaylists();
    const filteredPlaylists = playlists.filter(p => p.id !== id);
    
    if (filteredPlaylists.length === playlists.length) return false;

    this.savePlaylists(filteredPlaylists, true); // Salva imediatamente para deletar
    return true;
  }

  /**
   * Adicionar áudio à playlist (otimizado)
   */
  static addAudioToPlaylist(playlistId: string, audio: any): boolean {
    const playlists = this.getPlaylists();
    const playlist = playlists.find(p => p.id === playlistId);
    
    if (!playlist) return false;

    // Verifica se áudio já existe para evitar duplicatas
    if (playlist.audios.some(a => a.id === audio.id)) {
      return false;
    }

    const playlistAudio: PlaylistAudio = {
      id: audio.id,
      title: audio.title,
      description: audio.description || "",
      duration: audio.duration || "0:00",
      fieldId: audio.fieldId || "",
      fieldTitle: audio.fieldTitle || ""
    };

    playlist.audios.push(playlistAudio);
    playlist.updatedAt = new Date().toISOString();

    this.savePlaylists(playlists);
    return true;
  }

  /**
   * Remover áudio da playlist (otimizado)
   */
  static removeAudioFromPlaylist(playlistId: string, audioId: string): boolean {
    const playlists = this.getPlaylists();
    const playlist = playlists.find(p => p.id === playlistId);
    
    if (!playlist) return false;

    const originalLength = playlist.audios.length;
    playlist.audios = playlist.audios.filter(a => a.id !== audioId);
    
    if (playlist.audios.length === originalLength) return false;

    playlist.updatedAt = new Date().toISOString();
    this.savePlaylists(playlists);
    return true;
  }

  /**
   * Buscar playlist por ID
   */
  static getPlaylistById(id: string): Playlist | null {
    const playlists = this.getPlaylists();
    return playlists.find(p => p.id === id) || null;
  }
}
