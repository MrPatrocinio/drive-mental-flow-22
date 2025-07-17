import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { RefreshButton } from "@/components/RefreshButton";
import { ContentService } from "@/services/contentService";
import { Play, Clock, ArrowRight, Settings } from "lucide-react";
import { AddToPlaylistButton } from "@/components/playlist/AddToPlaylistButton";
import { useState, useCallback, useEffect, useMemo } from "react";
import { useSync } from "@/hooks/useSync";
import { DriveMentalConfigPanel } from "@/components/DriveMentalConfigPanel";
import { DriveMentalProgrammingService, DriveMentalConfig } from "@/services/driveMentalProgrammingService";
import * as Icons from "lucide-react";

export default function FieldPage() {
  const { fieldId } = useParams<{ fieldId: string }>();
  const navigate = useNavigate();
  const [selectedAudio, setSelectedAudio] = useState<string | null>(null);
  const [showConfigPanel, setShowConfigPanel] = useState<string | null>(null);
  const [field, setField] = useState(() => {
    if (!fieldId) return null;
    const editableField = ContentService.getEditableFields().find(f => f.id === fieldId);
    if (!editableField) return null;
    
    const audios = ContentService.getAudiosByField(fieldId);
    return {
      ...editableField,
      icon: (Icons as any)[editableField.iconName] || Icons.Circle,
      audios
    };
  });

  const handleSyncEvent = useCallback(() => {
    if (!fieldId) return;
    const editableField = ContentService.getEditableFields().find(f => f.id === fieldId);
    if (!editableField) {
      setField(null);
      return;
    }
    
    const audios = ContentService.getAudiosByField(fieldId);
    setField({
      ...editableField,
      icon: (Icons as any)[editableField.iconName] || Icons.Circle,
      audios
    });
  }, [fieldId]);

  useSync(handleSyncEvent, ['audios_updated', 'fields_updated']);

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

  // Calcular duração total de forma estável
  const totalDuration = useMemo(() => {
    if (!field?.audios) return "0h 0min";
    const totalMinutes = field.audios.length * 25; // Assumindo 25min por áudio
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}min`;
  }, [field?.audios?.length]);

  const handlePlayAudio = (audioId: string) => {
    setSelectedAudio(audioId);
    navigate(`/campo/${fieldId}/audio/${audioId}`);
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

  return (
    <div className="min-h-screen hero-gradient">
      <Header showBackButton title={field.title} />
      
      <div className="container mx-auto px-4 py-12">
        {/* Header do Campo */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6">
            <field.icon className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{field.title}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {field.description}
          </p>
          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              <span>{field.audioCount} áudios</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Duração total: {totalDuration}</span>
            </div>
            <RefreshButton variant="ghost" size="sm" showText={false} />
          </div>
        </div>

        {/* Lista de Áudios */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">Áudios Disponíveis</h2>
          
          <div className="space-y-4">
            {field.audios.map((audio, index) => (
              <div 
                key={audio.id} 
                className="field-card group cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => handlePlayAudio(audio.id)}
              >
                  <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 smooth-transition">
                      <Play className="h-5 w-5 text-primary" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{audio.title}</h3>
                      <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                        {audio.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {audio.duration}
                        </span>
                        <span>#{index + 1}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 smooth-transition">
                    <AddToPlaylistButton
                      audio={{
                        id: audio.id,
                        title: audio.title,
                        description: audio.description,
                        duration: audio.duration,
                        fieldId: fieldId!,
                        fieldTitle: field.title
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConfigureAudio(audio.id);
                      }}
                      className="p-2"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="card-gradient rounded-2xl p-8 text-center max-w-2xl mx-auto mt-12">
          <h3 className="text-2xl font-bold mb-4">
            Pronto para começar sua transformação?
          </h3>
          <p className="text-muted-foreground mb-6">
            Selecione um áudio acima e comece sua sessão de reprogramação mental
          </p>
          <Button 
            variant="premium" 
            size="lg"
            onClick={() => field.audios.length > 0 && handlePlayAudio(field.audios[0].id)}
          >
            Começar com o Primeiro Áudio
          </Button>
        </div>
      </div>

      {/* Panel de Configuração de Drive Mental */}
      {showConfigPanel && field && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <DriveMentalConfigPanel
            audioId={showConfigPanel}
            fieldId={fieldId!}
            audioTitle={field.audios.find(a => a.id === showConfigPanel)?.title || ''}
            onStartSession={handleStartSession}
            onClose={() => setShowConfigPanel(null)}
          />
        </div>
      )}
    </div>
  );
}