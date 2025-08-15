
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AudioCard } from "@/components/AudioCard";
import { FieldCard } from "@/components/FieldCard";
import { TagFilter } from "@/components/TagFilter";
import { PricingDisplay } from "@/components/PricingDisplay";
import { useToast } from "@/hooks/use-toast";
import { ContentService } from "@/services/contentService";
import { DiagnosticService } from "@/services/diagnosticService";
import { FirstVisitMusicPrompt } from "@/components/FirstVisitMusicPrompt";
import { useAudioPlayback } from "@/contexts/AudioPlaybackContext";
import { useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";

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

interface AudioData {
  id: string;
  title: string;
  duration: string;
  url: string;
  tags: string[];
  field_id?: string;
}

interface FieldData {
  id: string;
  title: string;
  description: string;
  icon: string;
  audio_count: number;
}

interface PricingData {
  price: number;
  currency: string;
  payment_type: string;
  access_type: string;
  benefits: string[];
  button_text: string;
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

const LandingPage = () => {
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
  const navigate = useNavigate();

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
    DiagnosticService.info('LandingPage', 'Iniciando carregamento de conteúdo');
    
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
      const landingContent = ContentService.getLandingPageContent();
      if (landingContent) {
        console.log('LandingPage: Conteúdo da landing carregado:', landingContent);
        // Adaptar estrutura do contentService para nossa interface
        setContent({
          hero_title: landingContent.hero.title,
          hero_subtitle: landingContent.hero.subtitle,
          hero_cta_text: landingContent.hero.ctaText,
          about_title: "Sobre nós",
          about_content: "Nossa plataforma oferece áudios especializados para desenvolvimento pessoal e mental.",
          features_title: "Funcionalidades",
          features: landingContent.features.map(f => ({
            title: f.title,
            description: f.description,
            icon: f.icon
          }))
        });
      }

      // Por enquanto, usar dados mockados para áudios e campos
      console.log('LandingPage: Usando dados mockados para demonstração');
      const mockAudios: AudioData[] = [
        {
          id: "1",
          title: "Áudio de Demonstração 1",
          duration: "15:30",
          url: "#",
          tags: ["relaxamento", "meditação"],
          field_id: "1"
        },
        {
          id: "2", 
          title: "Áudio de Demonstração 2",
          duration: "20:45",
          url: "#",
          tags: ["foco", "concentração"],
          field_id: "2"
        }
      ];

      const mockFields: FieldData[] = [
        {
          id: "1",
          title: "Relaxamento",
          description: "Técnicas de relaxamento profundo",
          icon: "Brain",
          audio_count: 5
        },
        {
          id: "2",
          title: "Foco Mental",
          description: "Desenvolvimento da concentração",
          icon: "Target",
          audio_count: 8
        }
      ];

      const mockPricing: PricingData = {
        price: 97,
        currency: "R$",
        payment_type: "Pagamento único",
        access_type: "Acesso vitalício",
        benefits: [
          "Acesso completo aos áudios especializados",
          "Suporte especializado 24/7",
          "Atualizações constantes de conteúdo"
        ],
        button_text: "Começar Agora"
      };

      setAudioData(mockAudios);
      setFieldData(mockFields);
      setPricingData(mockPricing);
      setFilteredAudios(mockAudios);

      DiagnosticService.info('LandingPage', 'Carregamento concluído com sucesso');
      console.log('LandingPage: Carregamento concluído com sucesso');

    } catch (error) {
      console.error('LandingPage: Erro no carregamento:', error);
      DiagnosticService.error('LandingPage', 'Erro no carregamento', error);
      
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

  const handleAudioPlay = (audio: AudioData) => {
    console.log('LandingPage: Reproduzindo áudio:', audio.title);
    navigate(`/audio/${audio.id}`);
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
                <FieldCard 
                  key={field.id}
                  title={field.title}
                  icon={(Icons as any)[field.icon] || Icons.Circle}
                  audioCount={field.audio_count}
                  fieldId={field.id}
                />
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
              <AudioCard 
                key={audio.id} 
                audio={audio} 
                onPlay={handleAudioPlay}
              />
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
            <PricingDisplay />
          </div>
        </section>
      )}
    </div>
  );
};

export default LandingPage;
