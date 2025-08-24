
/**
 * useFieldPage Hook
 * Responsabilidade: Hook específico para página de campo
 * Princípio SRP: Apenas lógica de hook para campo
 * Princípio DRY: Centraliza lógica reutilizável
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDataSync } from '@/hooks/useDataSync';
import { FieldPageService } from '@/services/fieldPageService';

interface AudioData {
  id: string;
  title: string;
  description?: string;
  file_url: string;
  cover_image_url?: string;
  duration?: string;
  is_premium: boolean;
  tags?: string[];
}

interface FieldData {
  id: string;
  title: string;
  description?: string;
}

export const useFieldPage = (fieldId: string | undefined) => {
  const [field, setField] = useState<FieldData | null>(null);
  const [audios, setAudios] = useState<AudioData[]>([]);
  const [filteredAudios, setFilteredAudios] = useState<AudioData[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Ref para evitar múltiplas chamadas simultâneas
  const isLoadingRef = useRef(false);

  const loadFieldData = useCallback(async () => {
    if (!fieldId || isLoadingRef.current) {
      return;
    }

    // Validações básicas
    if (!FieldPageService.isValidUUID(fieldId)) {
      console.error('useFieldPage: fieldId não é um UUID válido:', fieldId);
      setError('ID do campo inválido');
      setIsLoading(false);
      return;
    }

    try {
      isLoadingRef.current = true;
      setIsLoading(true);
      setError(null);

      // Buscar campo e áudios em paralelo
      const [fieldData, audiosData] = await Promise.all([
        FieldPageService.getFieldById(fieldId),
        FieldPageService.getAudiosByFieldId(fieldId)
      ]);

      // Filtrar áudios acessíveis
      const accessibleAudios = FieldPageService.filterAccessibleAudios(audiosData);

      console.log('useFieldPage: Dados carregados:', {
        field: fieldData.title,
        audiosCount: accessibleAudios.length
      });

      setField(fieldData);
      setAudios(accessibleAudios);
      setFilteredAudios(accessibleAudios);

    } catch (error) {
      console.error('useFieldPage: Erro ao carregar dados:', error);
      setError(error instanceof Error ? error.message : 'Erro inesperado ao carregar dados');
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [fieldId]);

  // Handler para sincronização de dados - memoizado
  const handleDataSync = useCallback(() => {
    console.log('useFieldPage: Dados sincronizados, recarregando...');
    loadFieldData();
  }, [loadFieldData]);

  // Hook de sincronização
  useDataSync({
    onFieldsChange: handleDataSync,
    onAudiosChange: handleDataSync
  });

  // Carregamento inicial
  useEffect(() => {
    loadFieldData();
  }, [loadFieldData]);

  // Handler para filtro de tags - memoizado
  const handleTagFilter = useCallback((tags: string[]) => {
    console.log('useFieldPage: Filtrando por tags:', tags);
    setSelectedTags(tags);
    
    const filtered = FieldPageService.filterAudiosByTags(audios, tags);
    setFilteredAudios(filtered);
  }, [audios]);

  // Extração de tags - memoizada
  const allTags = FieldPageService.extractAllTags(audios);

  return {
    field,
    audios,
    filteredAudios,
    selectedTags,
    isLoading,
    error,
    allTags,
    handleTagFilter,
    refetch: loadFieldData
  };
};
