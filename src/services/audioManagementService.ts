/**
 * Audio Management Service - Responsável pela lógica de negócio dos áudios
 * Responsabilidade: Gerenciar operações CRUD de áudios
 * Princípio SRP: Apenas lógica de negócio de áudios
 * Princípio SSOT: Interface única para manipulação de áudios
 */

import { AudioService, Audio as EditableAudio } from "./supabase/audioService";
import { FieldService } from "./supabase/fieldService";
import { DataSyncService } from "./dataSync";

export interface AudioFormData {
  title: string;
  duration: string;
  url: string;
  description: string;
  fieldId: string;
}

export class AudioManagementService {
  /**
   * Obtém todos os áudios para administração
   */
  static async getAllAudios(): Promise<EditableAudio[]> {
    return await AudioService.getAll();
  }

  static async getAudioById(audioId: string): Promise<EditableAudio | null> {
    return await AudioService.getById(audioId);
  }

  static async createAudio(audioData: AudioFormData): Promise<EditableAudio> {
    const newAudio = await AudioService.create({
      title: audioData.title,
      duration: audioData.duration,
      url: audioData.url,
      field_id: audioData.fieldId,
      tags: []
    });
    
    DataSyncService.forceNotification('audios_changed');
    return newAudio;
  }

  static async updateAudio(audioId: string, audioData: AudioFormData): Promise<EditableAudio | null> {
    try {
      const updatedAudio = await AudioService.update(audioId, {
        title: audioData.title,
        duration: audioData.duration,
        url: audioData.url,
        field_id: audioData.fieldId,
        tags: []
      });
      
      DataSyncService.forceNotification('audios_changed');
      return updatedAudio;
    } catch (error) {
      return null;
    }
  }

  static async deleteAudio(audioId: string): Promise<boolean> {
    try {
      await AudioService.delete(audioId);
      DataSyncService.forceNotification('audios_changed');
      return true;
    } catch (error) {
      return false;
    }
  }

  static async getAudiosByField(fieldId: string): Promise<EditableAudio[]> {
    return await AudioService.getByField(fieldId);
  }

  static async searchAudios(query: string): Promise<EditableAudio[]> {
    const allAudios = await AudioService.getAll();
    const searchTerm = query.toLowerCase();
    
    return allAudios.filter(audio => 
      audio.title.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Valida dados do áudio
   */
  static validateAudioData(audioData: AudioFormData): string[] {
    const errors: string[] = [];

    if (!audioData.title.trim()) {
      errors.push("Título é obrigatório");
    }

    if (!audioData.duration.trim()) {
      errors.push("Duração é obrigatória");
    } else if (!/^\d{1,2}:\d{2}$/.test(audioData.duration)) {
      errors.push("Duração deve estar no formato MM:SS");
    }

    if (!audioData.url.trim()) {
      errors.push("URL é obrigatória");
    } else if (!this.isValidUrl(audioData.url)) {
      errors.push("URL deve ser válida");
    }

    if (!audioData.description.trim()) {
      errors.push("Descrição é obrigatória");
    }

    if (!audioData.fieldId.trim()) {
      errors.push("Campo é obrigatório");
    }

    return errors;
  }

  /**
   * Valida se URL é válida
   */
  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Obtém estatísticas dos áudios
   */
  static async getAudioStats() {
    const audios = await this.getAllAudios();
    const fields = await FieldService.getAll();
    
    return {
      totalAudios: audios.length,
      totalFields: fields.length,
      audiosByField: fields.map(field => ({
        fieldId: field.id,
        fieldTitle: field.title,
        audioCount: field.audio_count
      }))
    };
  }
}