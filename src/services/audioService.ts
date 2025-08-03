import { FieldService } from "./supabase/fieldService";
import { AudioService as SupabaseAudioService } from "./supabase/audioService";
import * as Icons from "lucide-react";

export class AudioService {
  static async getAllFields() {
    const fields = await FieldService.getAll();
    return fields.map(field => ({
      ...field,
      icon: (Icons as any)[field.icon_name] || Icons.Circle,
      audios: [] // Will be loaded separately when needed
    }));
  }

  static async getFieldById(fieldId: string) {
    const field = await FieldService.getById(fieldId);
    if (!field) return undefined;
    
    return {
      ...field,
      icon: (Icons as any)[field.icon_name] || Icons.Circle,
      audios: [] // Will be loaded separately when needed
    };
  }

  static async getAudioById(fieldId: string, audioId: string) {
    return await SupabaseAudioService.getById(audioId);
  }

  static async searchAudios(query: string) {
    const allAudios = await SupabaseAudioService.getAll();
    return allAudios.filter(audio => 
      audio.title.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Removed mock authentication - only authenticated users can access
  static async authenticateUser(email: string, password: string): Promise<boolean> {
    // Authentication is handled by Supabase
    return false;
  }

  // Simula verificação de pagamento
  static async verifyPayment(userId: string): Promise<boolean> {
    // Mock payment verification - em produção seria integrado com sistema de pagamento
    return true;
  }
}