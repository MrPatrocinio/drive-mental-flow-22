
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { AudioCard } from "@/components/AudioCard";
import { TagFilter } from "@/components/TagFilter";
import { Loader2 } from "lucide-react";
import { useContentAccess } from "@/services/subscriptionAccessService";
import { useDataSync } from "@/hooks/useDataSync";

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
  slug: string;
}

// Função para validar UUID
const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export const FieldPage = () => {
  const { slug } = useParams();
  const [field, setField] = useState<FieldData | null>(null);
  const [audios, setAudios] = useState<AudioData[]>([]);
  const [filteredAudios, setFilteredAudios] = useState<AudioData[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hook para controle de acesso baseado em assinatura
  const { canAccessAudio } = useContentAccess();

  // Hook para sincronização de dados
  const { syncTrigger } = useDataSync();

  useEffect(() => {
    const fetchFieldAndAudios = async () => {
      if (!slug) {
        console.error('FieldPage: Slug não fornecido');
        setError('ID do campo não encontrado na URL');
        setIsLoading(false);
        return;
      }

      // Validar se o slug é um UUID válido
      if (!isValidUUID(slug)) {
        console.error('FieldPage: Slug não é um UUID válido:', slug);
        setError('ID do campo inválido');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        console.log('FieldPage: Buscando campo por ID:', slug);

        // Buscar informações do campo pelo ID
        const { data: fieldData, error: fieldError } = await supabase
          .from('fields')
          .select('*')
          .eq('id', slug) // Corrigido: buscar por ID ao invés de title
          .single();

        if (fieldError) {
          console.error('FieldPage: Erro ao buscar campo:', fieldError);
          if (fieldError.code === 'PGRST116') {
            setError('Campo não encontrado');
          } else {
            setError('Erro ao carregar informações do campo');
          }
          return;
        }

        console.log('FieldPage: Campo encontrado:', fieldData);
        
        // Mapear dados do campo para interface local
        const mappedField: FieldData = {
          id: fieldData.id,
          title: fieldData.title,
          description: fieldData.description,
          slug: fieldData.id // Usar ID como slug
        };
        
        setField(mappedField);

        // Buscar áudios do campo
        console.log('FieldPage: Buscando áudios para o campo:', fieldData.id);
        const { data: audiosData, error: audiosError } = await supabase
          .from('audios')
          .select('*')
          .eq('field_id', fieldData.id)
          .order('title');

        if (audiosError) {
          console.error('FieldPage: Erro ao buscar áudios:', audiosError);
          setError('Erro ao carregar áudios');
          return;
        }

        console.log('FieldPage: Áudios encontrados:', audiosData?.length || 0);

        // Mapear dados dos áudios para interface local
        const mappedAudios: AudioData[] = audiosData?.map(audio => ({
          id: audio.id,
          title: audio.title,
          description: undefined, // Campo não existe na tabela audios
          file_url: audio.url, // Mapear url para file_url
          cover_image_url: undefined, // Não disponível no banco atual
          duration: audio.duration,
          is_premium: audio.is_premium,
          tags: audio.tags || []
        })) || [];

        // Filtrar áudios baseado na assinatura do usuário
        const accessibleAudios = mappedAudios.filter(audio => 
          canAccessAudio(audio.is_premium, false) // is_demo sempre false para simplicidade
        );

        console.log('FieldPage: Áudios acessíveis:', accessibleAudios.length);

        setAudios(accessibleAudios);
        setFilteredAudios(accessibleAudios);

      } catch (error) {
        console.error('FieldPage: Erro geral:', error);
        setError('Erro inesperado ao carregar dados');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFieldAndAudios();
  }, [slug, canAccessAudio, syncTrigger]);

  // Filtra os áudios com base nas tags selecionadas
  const handleTagFilter = (tags: string[]) => {
    console.log('FieldPage: Filtrando por tags:', tags);
    setSelectedTags(tags);
    
    if (tags.length === 0) {
      setFilteredAudios(audios);
    } else {
      const filtered = audios.filter(audio => 
        audio.tags && audio.tags.some((tag: string) => tags.includes(tag))
      );
      setFilteredAudios(filtered);
    }
  };

  const allTags = Array.from(
    new Set(
      audios.flatMap(audio => audio.tags || [])
    )
  ).sort();

  // Função para lidar com reprodução de áudio - usar interface Audio do AudioCard
  const handlePlayAudio = (audio: { id: string; title: string; duration: string; url: string; tags?: string[]; field_id?: string }) => {
    console.log('FieldPage: Reproduzindo áudio:', audio.title);
    // Lógica de reprodução será implementada conforme necessário
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Carregando conteúdo...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !field) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              {error || 'Campo não encontrado'}
            </h1>
            <p className="text-muted-foreground">
              Verifique se o link está correto ou tente novamente.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {field.title}
          </h1>
          {field.description && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {field.description}
            </p>
          )}
        </div>

        {allTags.length > 0 && (
          <div className="mb-8">
            <TagFilter
              availableTags={allTags}
              selectedTags={selectedTags}
              onTagsChange={handleTagFilter}
            />
          </div>
        )}

        {filteredAudios.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {selectedTags.length > 0 
                ? 'Nenhum áudio encontrado com as tags selecionadas.'
                : 'Nenhum áudio disponível neste campo.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAudios.map((audio) => (
              <AudioCard
                key={audio.id}
                audio={{
                  id: audio.id,
                  title: audio.title,
                  duration: audio.duration || '0:00',
                  url: audio.file_url,
                  tags: audio.tags,
                  field_id: field.id
                }}
                onPlay={handlePlayAudio}
                showTags={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FieldPage;
