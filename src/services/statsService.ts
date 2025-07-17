import { ContentService } from "./contentService";
import { Audio, Field } from "@/data/mockData";

export interface StatsData {
  totalUsers: number;
  totalAudios: number;
  totalFields: number;
  totalPlaytime: string;
  mostPopularField: FieldStats;
  audiosByField: FieldStats[];
  userGrowth: GrowthData[];
  audioUsage: AudioUsageData[];
  activeUsers: ActiveUsersData[];
  usageByTime: UsageTimeData[];
  topAudios: TopAudioData[];
  platformUsage: PlatformData[];
}

export interface FieldStats {
  fieldId: string;
  fieldName: string;
  audioCount: number;
  totalDuration: number;
  usagePercentage: number;
}

export interface GrowthData {
  month: string;
  users: number;
  sessions: number;
}

export interface AudioUsageData {
  audioId: string;
  title: string;
  field: string;
  plays: number;
  duration: string;
}

export interface ActiveUsersData {
  period: string;
  count: number;
  color: string;
}

export interface UsageTimeData {
  hour: string;
  minutes: number;
  sessions: number;
}

export interface TopAudioData {
  title: string;
  shortTitle: string;
  plays: number;
  field: string;
}

export interface PlatformData {
  name: string;
  value: number;
  color: string;
}

export class StatsService {
  /**
   * Calcula estatísticas gerais do sistema
   */
  static getGeneralStats(): Pick<StatsData, 'totalUsers' | 'totalAudios' | 'totalFields' | 'totalPlaytime'> {
    const fields = ContentService.getEditableFields();
    const allAudios = ContentService.getAudios();
    
    // Simula dados de usuários e tempo de reprodução
    const totalUsers = 1247; // Mock data
    const totalPlaytime = this.calculateTotalPlaytime(allAudios);
    
    return {
      totalUsers,
      totalAudios: allAudios.length,
      totalFields: fields.length,
      totalPlaytime
    };
  }

  /**
   * Calcula estatísticas por campo
   */
  static getFieldStats(): FieldStats[] {
    const fields = ContentService.getEditableFields();
    const totalAudios = ContentService.getAudios().length;
    
    return fields.map(field => {
      const fieldAudios = ContentService.getAudiosByField(field.id);
      const totalDuration = this.calculateFieldDuration(fieldAudios);
      const usagePercentage = totalAudios > 0 ? (fieldAudios.length / totalAudios) * 100 : 0;
      
      return {
        fieldId: field.id,
        fieldName: field.title,
        audioCount: fieldAudios.length,
        totalDuration,
        usagePercentage
      };
    });
  }

  /**
   * Retorna o campo mais popular
   */
  static getMostPopularField(): FieldStats {
    const fieldStats = this.getFieldStats();
    return fieldStats.reduce((prev, current) => 
      prev.audioCount > current.audioCount ? prev : current
    );
  }

  /**
   * Gera dados de crescimento de usuários (mock)
   */
  static getUserGrowthData(): GrowthData[] {
    return [
      { month: "Jan", users: 850, sessions: 3200 },
      { month: "Fev", users: 920, sessions: 3800 },
      { month: "Mar", users: 1050, sessions: 4500 },
      { month: "Abr", users: 1150, sessions: 5200 },
      { month: "Mai", users: 1200, sessions: 5800 },
      { month: "Jun", users: 1247, sessions: 6400 }
    ];
  }

  /**
   * Gera dados de uso de áudios (mock)
   */
  static getAudioUsageData(): AudioUsageData[] {
    const allAudios = ContentService.getAudios();
    const fields = ContentService.getEditableFields();
    
    // Simula dados de reprodução
    const mockPlays = [520, 480, 450, 420, 380, 350, 320, 300];
    
    return allAudios.slice(0, 8).map((audio, index) => {
      const field = fields.find(f => f.id === audio.fieldId);
      
      return {
        audioId: audio.id,
        title: audio.title,
        field: field?.title || "Desconhecido",
        plays: mockPlays[index] || 100,
        duration: audio.duration
      };
    });
  }

  /**
   * Gera dados de usuários ativos por período
   */
  static getActiveUsersData(): ActiveUsersData[] {
    return [
      { period: "Hoje", count: 342, color: "hsl(var(--primary))" },
      { period: "Esta Semana", count: 1105, color: "hsl(var(--secondary))" },
      { period: "Este Mês", count: 2840, color: "hsl(var(--accent))" },
    ];
  }

  /**
   * Gera dados de uso por hora do dia
   */
  static getUsageTimeData(): UsageTimeData[] {
    return [
      { hour: "06", minutes: 45, sessions: 12 },
      { hour: "07", minutes: 120, sessions: 28 },
      { hour: "08", minutes: 180, sessions: 45 },
      { hour: "09", minutes: 240, sessions: 62 },
      { hour: "10", minutes: 280, sessions: 71 },
      { hour: "11", minutes: 320, sessions: 85 },
      { hour: "12", minutes: 290, sessions: 78 },
      { hour: "13", minutes: 310, sessions: 82 },
      { hour: "14", minutes: 350, sessions: 92 },
      { hour: "15", minutes: 380, sessions: 98 },
      { hour: "16", minutes: 420, sessions: 110 },
      { hour: "17", minutes: 450, sessions: 118 },
      { hour: "18", minutes: 520, sessions: 135 },
      { hour: "19", minutes: 580, sessions: 148 },
      { hour: "20", minutes: 620, sessions: 158 },
      { hour: "21", minutes: 540, sessions: 142 },
      { hour: "22", minutes: 380, sessions: 95 },
      { hour: "23", minutes: 220, sessions: 58 },
    ];
  }

  /**
   * Gera dados dos áudios mais ouvidos
   */
  static getTopAudiosData(): TopAudioData[] {
    const allAudios = ContentService.getAudios();
    const fields = ContentService.getEditableFields();
    const mockPlays = [850, 720, 680, 620, 580, 540, 520, 480];

    return allAudios.slice(0, 8).map((audio, index) => {
      const field = fields.find(f => f.id === audio.fieldId);
      const shortTitle = audio.title.length > 20 
        ? audio.title.substring(0, 20) + "..." 
        : audio.title;

      return {
        title: audio.title,
        shortTitle,
        plays: mockPlays[index] || 100,
        field: field?.title || "Desconhecido"
      };
    });
  }

  /**
   * Gera dados de uso por plataforma
   */
  static getPlatformUsageData(): PlatformData[] {
    return [
      { name: "Desktop", value: 680, color: "hsl(var(--primary))" },
      { name: "Mobile", value: 420, color: "hsl(var(--secondary))" },
      { name: "Tablet", value: 147, color: "hsl(var(--accent))" },
    ];
  }

  /**
   * Retorna todas as estatísticas consolidadas
   */
  static getAllStats(): StatsData {
    const generalStats = this.getGeneralStats();
    const fieldStats = this.getFieldStats();
    const mostPopularField = this.getMostPopularField();
    const userGrowth = this.getUserGrowthData();
    const audioUsage = this.getAudioUsageData();
    const activeUsers = this.getActiveUsersData();
    const usageByTime = this.getUsageTimeData();
    const topAudios = this.getTopAudiosData();
    const platformUsage = this.getPlatformUsageData();

    return {
      ...generalStats,
      mostPopularField,
      audiosByField: fieldStats,
      userGrowth,
      audioUsage,
      activeUsers,
      usageByTime,
      topAudios,
      platformUsage
    };
  }

  /**
   * Calcula o tempo total de reprodução dos áudios
   */
  private static calculateTotalPlaytime(audios: Audio[]): string {
    let totalMinutes = 0;
    
    audios.forEach(audio => {
      const [minutes, seconds] = audio.duration.split(':').map(Number);
      totalMinutes += minutes + (seconds / 60);
    });
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    
    return `${hours}h ${minutes}m`;
  }

  /**
   * Calcula a duração total de áudios de um campo
   */
  private static calculateFieldDuration(audios: Audio[]): number {
    let totalMinutes = 0;
    
    audios.forEach(audio => {
      const [minutes, seconds] = audio.duration.split(':').map(Number);
      totalMinutes += minutes + (seconds / 60);
    });
    
    return Math.floor(totalMinutes);
  }
}