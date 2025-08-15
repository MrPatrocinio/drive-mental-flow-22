
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AudioCard } from "@/components/AudioCard";
import { FieldCard } from "@/components/FieldCard";
import { TagFilter } from "@/components/TagFilter";
import { PricingDisplay } from "@/components/PricingDisplay";
import { useToast } from "@/hooks/use-toast";
import { contentService, AudioData, FieldData, PricingData } from "@/services/contentService";
import { diagnosticService } from "@/services/diagnosticService";
import { FirstVisitMusicPrompt } from "@/components/FirstVisitMusicPrompt";
import { useAudioPlayback } from "@/contexts/AudioPlaybackContext";

interface LandingContent {
  hero_title: string;
  hero_subtitle: string;
  hero_cta_text: string;
  about_title: string;
  about_content: string;
  features_title: string;
  features: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
}

const DEFAULT_CONTENT: LandingContent = {
  hero_title: "Drive Mental",
  hero_subtitle: "Transforme sua mente com nossa plataforma de áudios especializados",
  hero_cta_text: "Comece agora",
  about_title: "Sobre nós",
  about_content: "Nossa plataforma oferece áudios especializados para desenvolvimento pessoal e mental.",
  features_title: "Funcionalidades",
  features: [
    {
      title: "Áudios Especializados",
      description: "Conteúdo profissional para seu desenvolvimento",
      icon: "🎧"
    },
    {
      title: "Campos Específicos",
      description: "Organize por áreas de interesse",
      icon: "📚"
    },
    {
      title: "Qualidade Premium",
      description: "Áudio de alta qualidade para melhor experiência",
      icon: "⭐"
    }
  ]
};

export const LandingPage = () => {
  console.log('LandingPage: Componente iniciando...');
  
  const [content, setContent] = useState<LandingContent>(DEFAULT_CONTENT);
  const [audioData, setAudioData] = useState<AudioData[]>([]);
  const [fieldData, setFieldData] = useState<FieldData[]>([]);
  const [pricingData, setPricingData] = useState<PricingData | null>(null);
  const [filteredAudios, setFilteredAudios] = useState<AudioData[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { toast } = useToast();

  // Hook para controle de música de fundo e primeira visita
  const {
    shouldShowFirstVisitPrompt,
    dismissFirstVisitPrompt,
    toggleBackgroundMusic
  } = useAudioPlayback();

  console.log('LandingPage: Estado atual:', {
    isLoading,
    hasError,
    contentLoaded: !!content,
    audioCount: audioData.length,
    fieldCount: fieldData.length,
    hasPricing: !!pricingData,
    shouldShowFirstVisitPrompt
  });

  const loadContent = async () => {
    console.log('LandingPage: Iniciando carregamento de conteúdo...');
    diagnosticService.logStep('content-loading-start');
    
    const timeout = setTimeout(() => {
      console.warn('LandingPage: Timeout no carregamento - usando fallback');
      setIsLoading(false);
      toast({
        title: "Carregamento lento",
        description: "Alguns conteúdos podem não estar atualizados.",
        variant: "default"
      });
    }, 10000);

    try {
      setHasError(false);
      setErrorMessage('');

      console.log('LandingPage: Carregando conteúdo da landing...');
      const landingContent = await contentService.getLandingContent();
      if (landingContent) {
        console.log('LandingPage: Conteúdo da landing carregado:', landingContent);
        setContent(landingContent);
      }

      console.log('LandingPage: Carregando áudios...');
      const audios = await contentService.getAudios();
      console.log('LandingPage: Áudios carregados:', audios.length);
      setAudioData(audios);
      setFilteredAudios(audios);

      console.log('LandingPage: Carregando campos...');
      const fields = await contentService.getFields();
      console.log('LandingPage: Campos carregados:', fields.length);
      setFieldData(fields);

      console.log('LandingPage: Carregando pricing...');
      const pricing = await contentService.getPricing();
      console.log('LandingPage: Pricing carregado:', pricing);
      setPricingData(pricing);

      diagnosticService.logStep('content-loading-success');
      console.log('LandingPage: Carregamento concluído com sucesso');

    } catch (error) {
      console.error('LandingPage: Erro no carregamento:', error);
      diagnosticService.logError('content-loading-error', error);
      
      setHasError(true);
      setErrorMessage(error instanceof Error ? error.message : 'Erro desconhecido');
      
      toast({
        variant: "destructive",
        title: "Erro no carregamento",
        description: "Usando conteúdo padrão. Tente recarregar a página.",
      });
    } finally {
      clearTimeout(timeout);
      setIsLoading(false);
      console.log('LandingPage: Carregamento finalizado');
    }
  };

  useEffect(() => {
    console.log('LandingPage: useEffect executando loadContent...');
    loadContent();
  }, []);

  useEffect(() => {
    console.log('LandingPage: Filtrando áudios por tags:', selectedTags);
    if (selectedTags.length === 0) {
      setFilteredAudios(audioData);
    } else {
      const filtered = audioData.filter(audio => 
        selectedTags.some(tag => audio.tags.includes(tag))
      );
      console.log('LandingPage: Áudios filtrados:', filtered.length);
      setFilteredAudios(filtered);
    }
  }, [selectedTags, audioData]);

  const handleFirstVisitChoice = (enableMusic: boolean) => {
    console.log('LandingPage: Primeira escolha de música:', enableMusic);
    toggleBackgroundMusic(enableMusic);
    dismissFirstVisitPrompt();
  };

  const allTags = Array.from(new Set(audioData.flatMap(audio => audio.tags)));

  if (isLoading) {
    console.log('LandingPage: Renderizando estado de loading');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando conteúdo...</p>
        </div>
      </div>
    );
  }

  console.log('LandingPage: Renderizando página principal');

  return (
    <div className="min-h-screen">
      {/* Prompt de primeira visita para música de fundo */}
      <FirstVisitMusicPrompt
        isOpen={shouldShowFirstVisitPrompt}
        onClose={dismissFirstVisitPrompt}
        onMusicEnabled={handleFirstVisitChoice}
      />

      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center card-gradient">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-5xl font-bold text-foreground leading-tight">
            {content.hero_title}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {content.hero_subtitle}
          </p>
          <Button 
            size="lg" 
            className="px-8 py-3 text-lg"
            onClick={() => {
              const audiosSection = document.getElementById('audios');
              audiosSection?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {content.hero_cta_text}
          </Button>
          
          {hasError && (
            <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive text-sm">
                Alguns conteúdos podem não estar atualizados: {errorMessage}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold text-foreground">
            {content.about_title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {content.about_content}
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 card-gradient">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            {content.features_title}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {content.features.map((feature, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fields Section */}
      {fieldData.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">
              Campos Disponíveis
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fieldData.map((field) => (
                <FieldCard key={field.id} field={field} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Audios Section */}
      <section id="audios" className="py-16 px-4 card-gradient">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Áudios Disponíveis
          </h2>
          
          {allTags.length > 0 && (
            <div className="mb-8">
              <TagFilter
                availableTags={allTags}
                selectedTags={selectedTags}
                onTagsChange={setSelectedTags}
              />
            </div>
          )}
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAudios.map((audio) => (
              <AudioCard key={audio.id} audio={audio} />
            ))}
          </div>
          
          {filteredAudios.length === 0 && audioData.length > 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Nenhum áudio encontrado com as tags selecionadas.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Pricing Section */}
      {pricingData && (
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">
              Planos e Preços
            </h2>
            <PricingDisplay pricing={pricingData} />
          </div>
        </section>
      )}
    </div>
  );
};
