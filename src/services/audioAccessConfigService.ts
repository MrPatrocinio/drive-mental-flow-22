
/**
 * Audio Access Configuration Service
 * Responsabilidade: Gerenciar configurações de acesso aos áudios
 * Princípio SRP: Uma única responsabilidade - configurações de acesso
 * Princípio SSOT: Fonte única para lógica de configuração de acesso
 */

import { AudioService, Audio, AudioUpdate } from "./supabase/audioService";

export type AudioAccessType = 'free' | 'premium';

export interface AudioAccessConfig {
  id: string;
  title: string;
  accessType: AudioAccessType;
  is_premium: boolean;
}

/**
 * Serviço para gerenciar configurações de acesso dos áudios
 */
export class AudioAccessConfigService {
  /**
   * Converte áudio para configuração de acesso
   */
  static audioToAccessConfig(audio: Audio): AudioAccessConfig {
    return {
      id: audio.id,
      title: audio.title,
      accessType: audio.is_premium ? 'premium' : 'free',
      is_premium: audio.is_premium
    };
  }

  /**
   * Obtém estatísticas de acesso dos áudios
   */
  static async getAccessStats(): Promise<{
    total: number;
    premium: number;
    free: number;
    premiumPercentage: number;
  }> {
    const audios = await AudioService.getAll();
    const premium = audios.filter(audio => audio.is_premium).length;
    const free = audios.filter(audio => !audio.is_premium).length;
    const total = audios.length;
    
    return {
      total,
      premium,
      free,
      premiumPercentage: total > 0 ? Math.round((premium / total) * 100) : 0
    };
  }

  /**
   * Altera o tipo de acesso de um áudio
   */
  static async changeAudioAccess(
    audioId: string, 
    accessType: AudioAccessType
  ): Promise<Audio> {
    const updateData: AudioUpdate = {
      is_premium: accessType === 'premium'
    };

    console.log(`AudioAccessConfigService: Alterando acesso do áudio ${audioId} para ${accessType}`);
    return await AudioService.update(audioId, updateData);
  }

  /**
   * Altera múltiplos áudios para premium
   */
  static async makePremium(audioIds: string[]): Promise<void> {
    console.log(`AudioAccessConfigService: Alterando ${audioIds.length} áudios para premium`);
    
    const promises = audioIds.map(id => 
      this.changeAudioAccess(id, 'premium')
    );
    
    await Promise.all(promises);
  }

  /**
   * Altera múltiplos áudios para gratuito
   */
  static async makeFree(audioIds: string[]): Promise<void> {
    console.log(`AudioAccessConfigService: Alterando ${audioIds.length} áudios para gratuito`);
    
    const promises = audioIds.map(id => 
      this.changeAudioAccess(id, 'free')
    );
    
    await Promise.all(promises);
  }

  /**
   * Obtém áudios por tipo de acesso
   */
  static async getAudiosByAccess(accessType: AudioAccessType): Promise<Audio[]> {
    const allAudios = await AudioService.getAll();
    return allAudios.filter(audio => 
      accessType === 'premium' ? audio.is_premium : !audio.is_premium
    );
  }

  /**
   * Valida se a configuração de acesso está correta
   */
  static validateAccessConfig(isPremium: boolean): { isValid: boolean; message?: string } {
    // Para este caso simples, sempre é válido
    // Pode ser expandido no futuro com regras de negócio mais complexas
    return { isValid: true };
  }
}
