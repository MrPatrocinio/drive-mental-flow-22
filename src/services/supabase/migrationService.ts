import { ContentService } from "@/services/contentService";
import { SupabaseDataService } from "./dataService";

/**
 * Serviço para migração de dados do localStorage para Supabase
 * Responsabilidade: Migrar dados mock para banco real
 * Princípios: KISS para operações simples, fail-fast para detectar erros
 */
export class MigrationService {
  
  /**
   * Migra todos os dados do localStorage para Supabase
   */
  static async migrateAllData(): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    try {
      // 1. Migrar campos (fields)
      const fieldsResult = await this.migrateFields();
      if (!fieldsResult.success) {
        errors.push(...fieldsResult.errors);
      }

      // 2. Migrar áudios (depois dos campos)
      const audiosResult = await this.migrateAudios();
      if (!audiosResult.success) {
        errors.push(...audiosResult.errors);
      }

      // 3. Migrar conteúdo da landing page
      const contentResult = await this.migrateLandingContent();
      if (!contentResult.success) {
        errors.push(...contentResult.errors);
      }

      return {
        success: errors.length === 0,
        errors
      };
    } catch (error) {
      return {
        success: false,
        errors: ["Erro geral na migração: " + (error as Error).message]
      };
    }
  }

  /**
   * Migra campos do localStorage para Supabase
   */
  private static async migrateFields(): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    try {
      const localFields = ContentService.getEditableFields();
      
      for (const localField of localFields) {
        const { error } = await SupabaseDataService.createField({
          title: localField.title,
          icon_name: localField.iconName,
          description: localField.description || null,
          audio_count: localField.audioCount
        });

        if (error && !error.includes('duplicate')) {
          errors.push(`Erro ao migrar campo ${localField.title}: ${error}`);
        }
      }

      return { success: errors.length === 0, errors };
    } catch (error) {
      return {
        success: false,
        errors: [`Erro na migração de campos: ${(error as Error).message}`]
      };
    }
  }

  /**
   * Migra áudios do localStorage para Supabase
   */
  private static async migrateAudios(): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    try {
      // Primeiro, buscar campos já criados no Supabase para obter IDs
      const { data: supabaseFields, error: fieldsError } = await SupabaseDataService.getFields();
      
      if (fieldsError || !supabaseFields) {
        return {
          success: false,
          errors: [`Erro ao buscar campos: ${fieldsError}`]
        };
      }

      // Mapear fields locais para IDs do Supabase
      const localFields = ContentService.getEditableFields();
      
      for (const localField of localFields) {
        const supabaseField = supabaseFields.find(sf => sf.title === localField.title);
        
        if (!supabaseField) {
          errors.push(`Campo ${localField.title} não encontrado no Supabase`);
          continue;
        }

        // Buscar áudios locais deste campo
        const localAudios = ContentService.getAudiosByField(localField.id);
        
        for (const localAudio of localAudios) {
          const { error } = await SupabaseDataService.createAudio({
            field_id: supabaseField.id,
            title: localAudio.title,
            duration: localAudio.duration,
            url: localAudio.url
          });

          if (error && !error.includes('duplicate')) {
            errors.push(`Erro ao migrar áudio ${localAudio.title}: ${error}`);
          }
        }
      }

      return { success: errors.length === 0, errors };
    } catch (error) {
      return {
        success: false,
        errors: [`Erro na migração de áudios: ${(error as Error).message}`]
      };
    }
  }

  /**
   * Migra conteúdo da landing page para Supabase
   */
  private static async migrateLandingContent(): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    try {
      const localContent = ContentService.getLandingPageContent();
      
      // Migrar seção hero
      const { error: heroError } = await SupabaseDataService.updateLandingContent('hero', localContent.hero);
      if (heroError) {
        errors.push(`Erro ao migrar hero: ${heroError}`);
      }

      // Migrar features
      const { error: featuresError } = await SupabaseDataService.updateLandingContent('features', localContent.features);
      if (featuresError) {
        errors.push(`Erro ao migrar features: ${featuresError}`);
      }

      // Migrar footer
      const { error: footerError } = await SupabaseDataService.updateLandingContent('footer', localContent.footer);
      if (footerError) {
        errors.push(`Erro ao migrar footer: ${footerError}`);
      }

      return { success: errors.length === 0, errors };
    } catch (error) {
      return {
        success: false,
        errors: [`Erro na migração de conteúdo: ${(error as Error).message}`]
      };
    }
  }

  /**
   * Verifica se já existem dados no Supabase
   */
  static async hasExistingData(): Promise<boolean> {
    try {
      const { data: fields } = await SupabaseDataService.getFields();
      return (fields && fields.length > 0) || false;
    } catch {
      return false;
    }
  }
}