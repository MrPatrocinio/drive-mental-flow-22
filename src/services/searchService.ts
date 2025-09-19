import { supabase } from "@/integrations/supabase/client";
import { DebounceService } from "./debounceService";

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
   * Busca unificada com Full-Text Search
   */
  static async searchUnified(query: string): Promise<SearchResult[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      // Usar query SQL raw porque a view não está nos tipos gerados
      const { data, error } = await supabase.rpc('search_unified_content', {
        search_query: query
      });

      if (error) {
        console.error('Erro na busca unificada:', error);
        return [];
      }

      return data || [];
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