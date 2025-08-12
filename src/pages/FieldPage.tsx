
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { RefreshButton } from "@/components/RefreshButton";
import { Play, Clock, Crown } from "lucide-react";
import { useState, useCallback, useEffect, useMemo } from "react";
import { DriveMentalConfigPanel } from "@/components/DriveMentalConfigPanel";
import { DriveMentalConfig } from "@/services/driveMentalProgrammingService";
import { FieldService, Field } from "@/services/supabase/fieldService";
import { AudioService, Audio } from "@/services/supabase/audioService";
import { AudioCard } from "@/components/AudioCard";
import { TagFilter } from "@/components/TagFilter";
import { PremiumContentGate } from "@/components/subscription/PremiumContentGate";
import { useToast } from "@/hooks/use-toast";
import { useDataSync } from "@/hooks/useDataSync";
import { useContentAccess } from "@/services/subscriptionAccessService";
import * as Icons from "lucide-react";

export default function FieldPage() {
  const { fieldId } = useParams<{ fieldId: string }>();
  const navigate = useNavigate();
  const [selectedAudio, setSelectedAudio] = useState<string | null>(null);
  const [showConfigPanel, setShowConfigPanel] = useState<string | null>(null);
  const [field, setField] = useState<Field | null>(null);
  const [audios, setAudios] = useState<Audio[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { canAccessAudio } = useContentAccess();

  useEffect(() => {
    if (fieldId) {
      loadFieldData();
    }
  }, [fieldId]);

  const loadFieldData = async () => {
    if (!fieldId) return;
    
    setIsLoading(true);
    try {
      const [fieldData, audiosData] = await Promise.all([
        FieldService.getById(fieldId),
        AudioService.getByField(fieldId)
      ]);

      if (!fieldData) {
        setField(null);
        return;
      }

      setField(fieldData);
      setAudios(audiosData);

      // Extrair todas as tags únicas dos áudios
      const allTags = audiosData
        .flatMap(audio => audio.tags || [])
        .filter((tag, index, arr) => arr.indexOf(tag) === index)
        .sort();
      setAvailableTags(allTags);

    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do campo",
        variant: "destructive",
      });
      setField(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Setup data sync
  useDataSync({
    onFieldsChange: loadFieldData,
    onAudiosChange: loadFieldData
  });

  // Filtrar áudios por tags selecionadas
  const filteredAudios = useMemo(() => {
    if (selectedTags.length === 0) return audios;
    
    return audios.filter(audio => 
      audio.tags && selectedTags.some(tag => audio.tags.includes(tag))
    );
  }, [audios, selectedTags]);

  // Separar áudios gratuitos e premium
  const { freeAudios, premiumAudios } = useMemo(() => {
    const free = filteredAudios.filter(audio => !audio.is_premium);
    const premium = filteredAudios.filter(audio => audio.is_premium);
    return { freeAudios: free, premiumAudios: premium };
  }, [filteredAudios]);

  // Calcular duração total
  const totalDuration = useMemo(() => {
    if (!audios.length) return "0h 0min";
    const totalSeconds = audios.reduce((total, audio) => {
      const [minutes, seconds] = audio.duration.split(':').map(Number);
      return total + (minutes * 60) + (seconds || 0);
    }, 0);
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
  }, [audios]);

  if (isLoading) {
    return (
      <div className="min-h-screen hero-gradient">
        <Header showBackButton />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="animate-pulse">
            <div className="w-20 h-20 bg-muted rounded-2xl mx-auto mb-6"></div>
            <div className="h-8 bg-muted rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-muted rounded w-96 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!field) {
    return (
      <div className="min-h-screen hero-gradient">
        <Header showBackButton />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Campo não encontrado</h1>
          <Button onClick={() => navigate('/dashboard')}>
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const handlePlayAudio = (audio: Audio) => {
    // Verificar acesso antes de reproduzir
    if (!canAccessAudio(audio.is_premium)) {
      toast({
        title: "Acesso Restrito",
        description: "Este áudio é exclusivo para assinantes premium.",
        variant: "destructive",
      });
      return;
    }
    
    navigate(`/campo/${fieldId}/audio/${audio.id}`);
  };

  const handleConfigureAudio = (audioId: string) => {
    setShowConfigPanel(audioId);
  };

  const handleStartSession = (config: DriveMentalConfig) => {
    setShowConfigPanel(null);
    navigate(`/campo/${fieldId}/audio/${config.audioId}`, { 
      state: { driveMentalConfig: config } 
    });
  };

  const FieldIcon = (Icons as any)[field.icon_name] || Icons.Circle;

  const renderAudioSection = (title: string, audios: Audio[], icon: React.ReactNode) => {
    if (audios.length === 0) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          {icon}
          <h3 className="text-lg font-semibold">{title}</h3>
          <span className="text-sm text-muted-foreground">({audios.length})</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {audios.map((audio, index) => (
            <div 
              key={audio.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {audio.is_premium ? (
                <PremiumContentGate
                  isPremium={audio.is_premium}
                  contentTitle={audio.title}
                  showPreview={true}
                >
                  <AudioCard
                    audio={audio}
                    onPlay={handlePlayAudio}
                    showTags={true}
                  />
                </PremiumContentGate>
              ) : (
                <AudioCard
                  audio={audio}
                  onPlay={handlePlayAudio}
                  showTags={true}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen hero-gradient">
      <Header showBackButton title={field.title} />
      
      <div className="container mx-auto px-4 py-12">
        {/* Header do Campo */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6">
            <FieldIcon className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{field.title}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {field.description}
          </p>
          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              <span>{audios.length} áudios</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Duração total: {totalDuration}</span>
            </div>
            <RefreshButton onRefresh={loadFieldData} variant="ghost" size="sm" showText={false} />
          </div>
        </div>

        {/* Filtros e Lista de Áudios */}
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar com Filtros */}
            <div className="lg:w-72 space-y-6">
              <div className="bg-card rounded-lg p-6 border">
                <TagFilter
                  availableTags={availableTags}
                  selectedTags={selectedTags}
                  onTagsChange={setSelectedTags}
                />
              </div>
            </div>

            {/* Lista de Áudios */}
            <div className="flex-1 space-y-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  Áudios Disponíveis
                  {selectedTags.length > 0 && (
                    <span className="text-sm text-muted-foreground ml-2">
                      ({filteredAudios.length} de {audios.length})
                    </span>
                  )}
                </h2>
              </div>
              
              {filteredAudios.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {selectedTags.length > 0 
                      ? "Nenhum áudio encontrado com as tags selecionadas" 
                      : "Nenhum áudio disponível neste campo"}
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Áudios Gratuitos */}
                  {renderAudioSection(
                    "Conteúdo Gratuito",
                    freeAudios,
                    <Play className="h-5 w-5 text-green-500" />
                  )}
                  
                  {/* Áudios Premium */}
                  {renderAudioSection(
                    "Conteúdo Premium",
                    premiumAudios,
                    <Crown className="h-5 w-5 text-primary" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        {audios.length > 0 && (
          <div className="card-gradient rounded-2xl p-8 text-center max-w-2xl mx-auto mt-12">
            <h3 className="text-2xl font-bold mb-4">
              Pronto para começar sua transformação?
            </h3>
            <p className="text-muted-foreground mb-6">
              Selecione um áudio acima e comece sua sessão de reprogramação mental
            </p>
            <Button 
              variant="default"
              size="lg"
              onClick={() => handlePlayAudio(audios[0])}
            >
              Começar com o Primeiro Áudio
            </Button>
          </div>
        )}
      </div>

      {/* Panel de Configuração de Drive Mental */}
      {showConfigPanel && field && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <DriveMentalConfigPanel
            audioId={showConfigPanel}
            fieldId={fieldId!}
            audioTitle={audios.find(a => a.id === showConfigPanel)?.title || ''}
            onStartSession={handleStartSession}
            onClose={() => setShowConfigPanel(null)}
          />
        </div>
      )}
    </div>
  );
}
