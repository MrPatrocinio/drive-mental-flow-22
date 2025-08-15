
export interface AudioPreferences {
  volume: number;
  repeatCount: number; // 0 = infinite, >0 = specific number
  autoPlay: boolean;
  showProgress: boolean;
  backgroundMusicEnabled: boolean;
  isFirstVisit: boolean; // Nova propriedade para controlar primeira visita
}

export interface AudioPreferencesService {
  getPreferences(): AudioPreferences;
  updatePreferences(preferences: Partial<AudioPreferences>): void;
  resetToDefaults(): void;
  markFirstVisitComplete(): void;
}

const DEFAULT_PREFERENCES: AudioPreferences = {
  volume: 70,
  repeatCount: 0, // infinite by default
  autoPlay: false,
  showProgress: true,
  backgroundMusicEnabled: false, // Mudado para false por padrão
  isFirstVisit: true, // Nova propriedade - primeira visita
};

const STORAGE_KEY = 'audio-preferences';

class AudioPreferencesServiceImpl implements AudioPreferencesService {
  private preferences: AudioPreferences;

  constructor() {
    this.preferences = this.loadPreferences();
  }

  private loadPreferences(): AudioPreferences {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_PREFERENCES, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load audio preferences:', error);
    }
    return { ...DEFAULT_PREFERENCES };
  }

  private savePreferences(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.preferences));
    } catch (error) {
      console.warn('Failed to save audio preferences:', error);
    }
  }

  getPreferences(): AudioPreferences {
    return { ...this.preferences };
  }

  updatePreferences(updates: Partial<AudioPreferences>): void {
    // Validate inputs
    if (updates.volume !== undefined) {
      updates.volume = Math.max(0, Math.min(100, updates.volume));
    }
    
    if (updates.repeatCount !== undefined) {
      updates.repeatCount = Math.max(0, updates.repeatCount);
    }

    this.preferences = { ...this.preferences, ...updates };
    this.savePreferences();
  }

  markFirstVisitComplete(): void {
    this.updatePreferences({ isFirstVisit: false });
  }

  resetToDefaults(): void {
    this.preferences = { ...DEFAULT_PREFERENCES };
    this.savePreferences();
  }
}

export const audioPreferencesService = new AudioPreferencesServiceImpl();
