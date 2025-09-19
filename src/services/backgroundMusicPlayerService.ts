/**
 * Background Music Player Service
 * Responsabilidade: Gerenciar reprodução de música de fundo
 * Princípio SRP: Apenas lógica de reprodução em background
 */

import { BackgroundMusicService, BackgroundMusic } from './supabase/backgroundMusicService';
import { BackgroundMusicSettingsService } from './supabase/backgroundMusicSettingsService';

export interface BackgroundMusicState {
  isPlaying: boolean;
  currentMusic: BackgroundMusic | null;
  volume: number;
  isLoading: boolean;
  hasError: boolean;
}

export class BackgroundMusicPlayerService {
  private static instance: BackgroundMusicPlayerService | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private activeMusic: BackgroundMusic[] = [];
  private currentMusicIndex = 0;
  private isInitialized = false;
  private isInitializing = false;
  private state: BackgroundMusicState = {
    isPlaying: false,
    currentMusic: null,
    volume: 0.25,
    isLoading: false,
    hasError: false
  };
  private stateChangeCallbacks: Array<(state: BackgroundMusicState) => void> = [];

  private constructor() {}

  static getInstance(): BackgroundMusicPlayerService {
    if (!BackgroundMusicPlayerService.instance) {
      BackgroundMusicPlayerService.instance = new BackgroundMusicPlayerService();
    }
    return BackgroundMusicPlayerService.instance;
  }

  async initialize(force: boolean = false): Promise<void> {
    if (this.isInitialized && !force) {
      console.log('BackgroundMusicPlayer: Já inicializado (skip).');
      return;
    }

    if (this.isInitializing) {
      console.log('BackgroundMusicPlayer: Inicialização em andamento');
      return;
    }

    this.isInitializing = true;

    try {
      console.log('BackgroundMusicPlayer: Inicializando sistema...', { force });
      this.updateState({ isLoading: true, hasError: false });

      // Carrega músicas ativas e configurações
      const [musicList, volumePercentage] = await Promise.all([
        BackgroundMusicService.getActive(),
        BackgroundMusicSettingsService.getVolumePercentage()
      ]);

      this.activeMusic = musicList || [];
      this.state.volume = volumePercentage / 100;

      console.log('BackgroundMusicPlayer: Músicas ativas encontradas:', this.activeMusic.length);
      console.log('BackgroundMusicPlayer: Volume configurado para:', volumePercentage + '%');

      if (this.activeMusic.length > 0) {
        if (this.currentMusicIndex < 0 || this.currentMusicIndex >= this.activeMusic.length) {
          this.currentMusicIndex = Math.floor(Math.random() * this.activeMusic.length);
        }
        await this.loadCurrentMusic();
        console.log('BackgroundMusicPlayer: Primeira música carregada');
      } else {
        console.warn('BackgroundMusicPlayer: Nenhuma música ativa encontrada');
        // Garante que currentMusic fique nulo se não houver músicas
        this.updateState({ currentMusic: null, isPlaying: false });
      }

      this.updateState({ isLoading: false });
      this.isInitialized = true;
    } catch (error) {
      console.error('BackgroundMusicPlayer: Erro ao inicializar:', error);
      this.updateState({ isLoading: false, hasError: true });
    } finally {
      this.isInitializing = false;
    }
  }

  private async loadCurrentMusic(): Promise<void> {
    if (this.activeMusic.length === 0) return;

    const music = this.activeMusic[this.currentMusicIndex];
    console.log('BackgroundMusicPlayer: Carregando música:', music.title);
    
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.removeEventListener('ended', this.handleMusicEnded);
      this.audioElement.removeEventListener('error', this.handleMusicError);
    }

    this.audioElement = new Audio(music.file_url);
    this.audioElement.volume = this.state.volume;
    this.audioElement.loop = false; // Controlamos manualmente para trocar músicas
    
    this.audioElement.addEventListener('ended', this.handleMusicEnded);
    this.audioElement.addEventListener('error', this.handleMusicError);
    this.audioElement.addEventListener('loadeddata', () => {
      console.log('BackgroundMusicPlayer: Música carregada com sucesso');
      this.updateState({ hasError: false });
    });

    this.updateState({ currentMusic: music });
  }

  private handleMusicEnded = (): void => {
    this.playNext();
  };

  private handleMusicError = (): void => {
    console.error('Erro ao reproduzir música de fundo');
    this.updateState({ hasError: true });
    this.playNext(); // Tenta próxima música
  };

  async play(): Promise<void> {
    console.log('BackgroundMusicPlayer: Tentando reproduzir música');

    if (!this.isInitialized || !this.audioElement || this.activeMusic.length === 0) {
      console.log('BackgroundMusicPlayer: Inicializando antes de tocar...');
      await this.initialize();
    }

    if (this.activeMusic.length === 0) {
      console.warn('BackgroundMusicPlayer: Nenhuma música ativa após inicializar - forçando refresh');
      await this.refresh();
    }

    // Se ainda não temos música após inicializar, seleciona uma
    if (!this.state.currentMusic && this.activeMusic.length > 0) {
      console.log('BackgroundMusicPlayer: Selecionando primeira música');
      await this.loadCurrentMusic();
    }

    if (this.audioElement && !this.state.hasError && this.state.currentMusic) {
      try {
        console.log('BackgroundMusicPlayer: Reproduzindo:', this.state.currentMusic.title);
        await this.audioElement.play();
        this.updateState({ isPlaying: true, hasError: false });
      } catch (error) {
        console.error('BackgroundMusicPlayer: Erro ao reproduzir:', error);
        this.updateState({ hasError: true, isPlaying: false });
      }
    } else {
      console.warn('BackgroundMusicPlayer: Não foi possível reproduzir - sem áudio/música');
    }
  }

  pause(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.updateState({ isPlaying: false });
    }
  }

  stop(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.updateState({ isPlaying: false });
    }
  }

  async playNext(): Promise<void> {
    if (this.activeMusic.length === 0) return;

    this.currentMusicIndex = (this.currentMusicIndex + 1) % this.activeMusic.length;
    await this.loadCurrentMusic();
    
    if (this.state.isPlaying) {
      await this.play();
    }
  }

  setVolume(userVolume: number): void {
    // Volume final = volume do usuário × percentual administrativo
    const finalVolume = userVolume * this.state.volume;
    
    if (this.audioElement) {
      this.audioElement.volume = finalVolume;
    }
  }

  setMuted(muted: boolean): void {
    if (this.audioElement) {
      this.audioElement.muted = muted;
    }
  }

  getState(): BackgroundMusicState {
    return { ...this.state };
  }

  onStateChange(callback: (state: BackgroundMusicState) => void): () => void {
    this.stateChangeCallbacks.push(callback);
    return () => {
      const index = this.stateChangeCallbacks.indexOf(callback);
      if (index > -1) {
        this.stateChangeCallbacks.splice(index, 1);
      }
    };
  }

  private updateState(updates: Partial<BackgroundMusicState>): void {
    this.state = { ...this.state, ...updates };
    this.stateChangeCallbacks.forEach(callback => callback(this.state));
  }

  async refresh(): Promise<void> {
    console.log('BackgroundMusicPlayer: Refresh solicitado - reinicializando estado');
    // Limpa listeners e áudio atual
    this.cleanup();
    // Reseta caches e flags
    this.activeMusic = [];
    this.currentMusicIndex = 0;
    this.isInitialized = false;
    // Reseta estado exposto
    this.updateState({ currentMusic: null, isPlaying: false, hasError: false, isLoading: false });
    // Recarrega com força para buscar músicas e configurações novamente
    await this.initialize(true);
  }

  cleanup(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.removeEventListener('ended', this.handleMusicEnded);
      this.audioElement.removeEventListener('error', this.handleMusicError);
      this.audioElement = null;
    }
  }
}

export const backgroundMusicPlayer = BackgroundMusicPlayerService.getInstance();