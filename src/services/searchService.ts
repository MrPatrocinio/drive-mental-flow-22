import { supabase } from "@/integrations/supabase/client";
import { DebounceService } from "./debounceService";
import { FieldService } from "./supabase/fieldService";
import { AudioService } from "./supabase/audioService";

/**
 * Search Service - Serviço para busca unificada
 * Responsabilidade: Gerenciar busca unificada entre campos e áudios
 * Princípio SRP: Apenas operações de busca
 * Princípio DRY: Reutilizável em toda aplicação
 */

export interface SearchResult {
  type: 'field' | 'audio';
  id: string;
  title: string;
  description?: string;
  field_id?: string;
}

export class SearchService {
  /**
   * Busca unificada com busca textual simples
   */
  static async searchUnified(query: string): Promise<SearchResult[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      const searchTerm = query.toLowerCase().trim();
      const results: SearchResult[] = [];

      // Buscar campos
      const fields = await FieldService.getAll();
      const matchingFields = fields.filter(field => 
        field.title.toLowerCase().includes(searchTerm) ||
        (field.description && field.description.toLowerCase().includes(searchTerm))
      );

      matchingFields.forEach(field => {
        results.push({
          type: 'field',
          id: field.id,
          title: field.title,
          description: field.description,
        });
      });

      // Buscar áudios
      const audios = await AudioService.getAll();
      const matchingAudios = audios.filter(audio => 
        audio.title.toLowerCase().includes(searchTerm) ||
        (audio.tags && audio.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
      );

      matchingAudios.forEach(audio => {
        results.push({
          type: 'audio',
          id: audio.id,
          title: audio.title,
          field_id: audio.field_id,
        });
      });

      // Ordenar por relevância (título exato primeiro, depois parcial)
      return results.sort((a, b) => {
        const aExactMatch = a.title.toLowerCase() === searchTerm;
        const bExactMatch = b.title.toLowerCase() === searchTerm;
        
        if (aExactMatch && !bExactMatch) return -1;
        if (!aExactMatch && bExactMatch) return 1;
        
        return a.title.localeCompare(b.title);
      }).slice(0, 20);

    } catch (error) {
      console.error('Erro na busca unificada:', error);
      return [];
    }
  }

  /**
   * Busca com debounce
   */
  static searchWithDebounce(
    query: string,
    callback: (results: SearchResult[]) => void,
    delay: number = 250
  ): void {
    const debouncedSearch = DebounceService.debounce(
      'unified-search',
      async (searchQuery: string) => {
        const results = await this.searchUnified(searchQuery);
        callback(results);
      },
      delay
    );

    debouncedSearch(query);
  }

  /**
   * Cancela busca pendente
   */
  static cancelSearch(): void {
    DebounceService.cancel('unified-search');
  }

  /**
   * Agrupa resultados por tipo
   */
  static groupResultsByType(results: SearchResult[]): {
    fields: SearchResult[];
    audios: SearchResult[];
  } {
    return results.reduce(
      (acc, result) => {
        if (result.type === 'field') {
          acc.fields.push(result);
        } else {
          acc.audios.push(result);
        }
        return acc;
      },
      { fields: [], audios: [] }
    );
  }
}