/**
 * Drive Mental Programming Service - Gerencia configurações de programação de drives mentais
 * Responsabilidade: Lógica de negócio para programação de drives mentais
 * Princípio SRP: Apenas lógica de programação de drives
 * Princípio SSOT: Fonte única para configurações de programação
 */

export interface DriveMentalConfig {
  audioId: string;
  fieldId: string;
  repetitions?: number;
  duration?: number; // em minutos
  volume: number; // 0-1
  autoPlay: boolean;
  sessionName?: string;
}

export class DriveMentalProgrammingService {
  private static readonly STORAGE_KEY = 'driveMentalConfigs';

  static saveConfig(config: DriveMentalConfig): void {
    try {
      const configs = this.getAllConfigs();
      const configKey = `${config.fieldId}_${config.audioId}`;
      configs[configKey] = config;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(configs));
    } catch (error) {
      console.error('Erro ao salvar configuração de drive mental:', error);
    }
  }

  static getConfig(fieldId: string, audioId: string): DriveMentalConfig | null {
    try {
      const configs = this.getAllConfigs();
      const configKey = `${fieldId}_${audioId}`;
      return configs[configKey] || null;
    } catch (error) {
      console.error('Erro ao carregar configuração de drive mental:', error);
      return null;
    }
  }

  static getAllConfigs(): Record<string, DriveMentalConfig> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Erro ao carregar configurações de drive mental:', error);
      return {};
    }
  }

  static deleteConfig(fieldId: string, audioId: string): void {
    try {
      const configs = this.getAllConfigs();
      const configKey = `${fieldId}_${audioId}`;
      delete configs[configKey];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(configs));
    } catch (error) {
      console.error('Erro ao deletar configuração de drive mental:', error);
    }
  }

  static getDefaultConfig(fieldId: string, audioId: string): DriveMentalConfig {
    return {
      audioId,
      fieldId,
      repetitions: 1,
      volume: 0.8,
      autoPlay: false,
      sessionName: `Sessão ${audioId.slice(0, 8)}`
    };
  }
}