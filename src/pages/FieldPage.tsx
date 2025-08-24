
import React from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { AudioCard } from "@/components/AudioCard";
import { TagFilter } from "@/components/TagFilter";
import { Loader2 } from "lucide-react";
import { useFieldPage } from "@/hooks/useFieldPage";

/**
 * FieldPage Component
 * Responsabilidade: UI da página de campo
 * Princípio SRP: Apenas apresentação e interação
 * Princípio KISS: Implementação simplificada usando hook dedicado
 */
export const FieldPage = () => {
  const { fieldId } = useParams();
  
  // Hook otimizado que encapsula toda a lógica
  const {
    field,
    filteredAudios,
    selectedTags,
    isLoading,
    error,
    allTags,
    handleTagFilter
  } = useFieldPage(fieldId);

  // Função para lidar com reprodução de áudio
  const handlePlayAudio = (audio: { 
    id: string; 
    title: string; 
    duration: string; 
    url: string; 
    tags?: string[]; 
    field_id?: string 
  }) => {
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
