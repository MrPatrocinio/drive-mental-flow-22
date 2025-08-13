import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { RefreshButton } from "@/components/RefreshButton";
import { Play, Clock, Crown, Lock } from "lucide-react";
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
import { useUser } from "@/contexts/UserContext";
import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent } from "@/components/ui/card";
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
  const { hasFullAccess, canAccessAudio, hasActiveSubscription } = useContentAccess();
  const { isAuthenticated } = useUser();
  const { createSubscription } = useSubscription();

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

  const handlePlayAudio = async (audio: Audio) => {
    // Verificar acesso ao áudio específico
    const hasAccess = await canAccessAudio(audio.is_premium || false);
    
    if (!hasAccess) {
      if (!isAuthenticated) {
        toast({
          title: "Login Necessário",
          description: "Faça login para acessar os áudios.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }
      
      toast({
        title: "Assinatura Necessária",
        description: "Este conteúdo é exclusivo para assinantes.",
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

  // Componente para exibir áudios com controle de acesso
  const AudioSection = () => {
    if (filteredAudios.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {selectedTags.length > 0 
              ? "Nenhum áudio encontrado com as tags selecionadas" 
              : "Nenhum áudio disponível neste campo"}
          </p>
        </div>
      );
    }

    // Se usuário tem acesso completo, mostrar todos os áudios normalmente
    if (hasFullAccess()) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAudios.map((audio, index) => (
            <div 
              key={audio.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <AudioCard
                audio={audio}
                onPlay={handlePlayAudio}
                showTags={true}
              />
            </div>
          ))}
        </div>
      );
    }

    // Se usuário não tem acesso completo, mostrar gate de conteúdo premium
    return (
      <PremiumContentGate
        contentTitle="Áudios deste campo"
        showPreview={true}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAudios.slice(0, 4).map((audio, index) => (
            <div 
              key={audio.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <AudioCard
                audio={audio}
                onPlay={handlePlayAudio}
                showTags={true}
              />
            </div>
          ))}
        </div>
      </PremiumContentGate>
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
            {!hasActiveSubscription && (
              <div className="flex items-center gap-2 text-primary">
                <Crown className="h-4 w-4" />
                <span>Conteúdo Premium</span>
              </div>
            )}
            <RefreshButton onRefresh={loadFieldData} variant="ghost" size="sm" showText={false} />
          </div>
        </div>

        {/* Status da Assinatura */}
        {!hasActiveSubscription && (
          <Card className="max-w-2xl mx-auto mb-8 border-primary/20 bg-primary/5">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Lock className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Conteúdo Exclusivo</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                {isAuthenticated 
                  ? "Assine para ter acesso completo a todos os áudios de transformação mental."
                  : "Faça login e assine para ter acesso completo a todos os áudios de transformação mental."
                }
              </p>
              <div className="flex gap-3 justify-center">
                {!isAuthenticated && (
                  <Button variant="outline" onClick={() => navigate('/login')}>
                    Fazer Login
                  </Button>
                )}
                <Button onClick={() => createSubscription('premium')}>
                  <Crown className="h-4 w-4 mr-2" />
                  Assinar Agora
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  Áudios Disponíveis
                  {!hasActiveSubscription && <Crown className="h-5 w-5 text-primary" />}
                  {selectedTags.length > 0 && (
                    <span className="text-sm text-muted-foreground ml-2">
                      ({filteredAudios.length} de {audios.length})
                    </span>
                  )}
                </h2>
              </div>
              
              <AudioSection />
            </div>
          </div>
        </div>

        {/* Call to Action */}
        {audios.length > 0 && hasActiveSubscription && (
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
