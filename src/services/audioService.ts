import { Field, Audio } from "@/data/mockData";
import { ContentService, EditableField, EditableAudio } from "./contentService";
import * as Icons from "lucide-react";

export class AudioService {
  // Convert EditableField to Field with proper icon
  private static convertToField(editableField: EditableField): Field {
    const IconComponent = (Icons as any)[editableField.iconName] || (Icons as any).Brain;
    
    return {
      ...editableField,
      icon: IconComponent,
      audios: ContentService.getAudiosByField(editableField.id)
    };
  }

  static getAllFields(): Field[] {
    const editableFields = ContentService.getEditableFields();
    return editableFields.map(field => this.convertToField(field));
  }

  static getFieldById(fieldId: string): Field | undefined {
    const editableField = ContentService.getEditableFields().find(field => field.id === fieldId);
    return editableField ? this.convertToField(editableField) : undefined;
  }

  static getAudioById(fieldId: string, audioId: string): Audio | undefined {
    const audios = ContentService.getAudiosByField(fieldId);
    return audios.find(audio => audio.id === audioId);
  }

  static searchAudios(query: string): Audio[] {
    const allAudios = ContentService.getAudios();
    return allAudios.filter(audio => 
      audio.title.toLowerCase().includes(query.toLowerCase()) ||
      audio.description.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Simula autenticação básica
  static async authenticateUser(email: string, password: string): Promise<boolean> {
    // Mock authentication - em produção seria uma chamada real de API
    return email === "dppsoft@gmail.com" && password === "123456";
  }

  // Simula verificação de pagamento
  static async verifyPayment(userId: string): Promise<boolean> {
    // Mock payment verification - em produção seria integrado com sistema de pagamento
    return true;
  }
}