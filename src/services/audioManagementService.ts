/**
 * Audio Management Service - Responsável pela lógica de negócio dos áudios
 * Responsabilidade: Gerenciar operações CRUD de áudios
 * Princípio SRP: Apenas lógica de negócio de áudios
 * Princípio SSOT: Interface única para manipulação de áudios
 */

import { ContentService, EditableAudio } from "./contentService";
import { SyncService } from "./syncService";

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
  static getAllAudios(): EditableAudio[] {
    return ContentService.getAudios();
  }

  /**
   * Obtém áudio por ID
   */
  static getAudioById(audioId: string): EditableAudio | undefined {
    return ContentService.getAudios().find(audio => audio.id === audioId);
  }

  /**
   * Cria novo áudio
   */
  static createAudio(audioData: AudioFormData): EditableAudio {
    const newAudio: EditableAudio = {
      id: ContentService.generateId(),
      ...audioData
    };

    ContentService.saveAudio(newAudio);
    SyncService.notifyAudiosUpdated();
    return newAudio;
  }

  /**
   * Atualiza áudio existente
   */
  static updateAudio(audioId: string, audioData: AudioFormData): EditableAudio | null {
    const existingAudio = this.getAudioById(audioId);
    if (!existingAudio) {
      return null;
    }

    const updatedAudio: EditableAudio = {
      ...existingAudio,
      ...audioData
    };

    ContentService.saveAudio(updatedAudio);
    SyncService.notifyAudiosUpdated();
    return updatedAudio;
  }

  /**
   * Remove áudio
   */
  static deleteAudio(audioId: string): boolean {
    const audio = this.getAudioById(audioId);
    if (!audio) {
      return false;
    }

    ContentService.deleteAudio(audioId);
    SyncService.notifyAudiosUpdated();
    return true;
  }

  /**
   * Obtém áudios por campo
   */
  static getAudiosByField(fieldId: string): EditableAudio[] {
    return ContentService.getAudiosByField(fieldId);
  }

  /**
   * Busca áudios por texto
   */
  static searchAudios(query: string): EditableAudio[] {
    const allAudios = this.getAllAudios();
    const searchTerm = query.toLowerCase();
    
    return allAudios.filter(audio => 
      audio.title.toLowerCase().includes(searchTerm) ||
      audio.description.toLowerCase().includes(searchTerm)
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
  static getAudioStats() {
    const audios = this.getAllAudios();
    const fields = ContentService.getEditableFields();
    
    return {
      totalAudios: audios.length,
      totalFields: fields.length,
      audiosByField: fields.map(field => ({
        fieldId: field.id,
        fieldTitle: field.title,
        audioCount: this.getAudiosByField(field.id).length
      }))
    };
  }
}