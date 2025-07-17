import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { AudioPlayer } from "@/components/AudioPlayer";
import { ContentService } from "@/services/contentService";
import { Button } from "@/components/ui/button";
import { RefreshButton } from "@/components/RefreshButton";
import { SkipForward, SkipBack, List } from "lucide-react";
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSync } from "@/hooks/useSync";
import * as Icons from "lucide-react";

export default function AudioPlayerPage() {
  const { fieldId, audioId } = useParams<{ fieldId: string; audioId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sessionCount, setSessionCount] = useState(0);
  
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

  const audio = field && audioId ? field.audios.find(a => a.id === audioId) : null;

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
  
  if (!field || !audio) {
    return (
      <div className="min-h-screen hero-gradient">
        <Header showBackButton />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Áudio não encontrado</h1>
          <Button onClick={() => navigate('/dashboard')}>
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const currentIndex = field.audios.findIndex(a => a.id === audioId);
  const nextAudio = currentIndex < field.audios.length - 1 ? field.audios[currentIndex + 1] : null;
  const prevAudio = currentIndex > 0 ? field.audios[currentIndex - 1] : null;

  const handleRepeatComplete = () => {
    setSessionCount(prev => prev + 1);
    
    if (sessionCount > 0 && sessionCount % 5 === 0) {
      toast({
        title: "Excelente progresso!",
        description: `Você completou ${sessionCount + 1} repetições. Continue assim!`,
      });
    }
  };

  const navigateToAudio = (targetAudioId: string) => {
    navigate(`/campo/${fieldId}/audio/${targetAudioId}`);
  };

  return (
    <div className="min-h-screen hero-gradient">
      <Header showBackButton title={field.title} />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header do Áudio */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <field.icon className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{audio.title}</h1>
          <p className="text-muted-foreground text-lg">{audio.description}</p>
          <div className="flex items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
            <span>Áudio {currentIndex + 1} de {field.audios.length}</span>
            <span>•</span>
            <span>Duração: {audio.duration}</span>
            <span>•</span>
            <RefreshButton variant="ghost" size="sm" showText={false} />
          </div>
        </div>

        {/* Player de Áudio */}
        <div className="mb-8">
          <AudioPlayer
            audioUrl={audio.url}
            title={audio.title}
            onRepeatComplete={handleRepeatComplete}
          />
        </div>

        {/* Controles de Navegação */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <Button
            variant="outline"
            disabled={!prevAudio}
            onClick={() => prevAudio && navigateToAudio(prevAudio.id)}
          >
            <SkipBack className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          <Button
            variant="ghost"
            onClick={() => navigate(`/campo/${fieldId}`)}
          >
            <List className="h-4 w-4 mr-2" />
            Ver Lista
          </Button>

          <Button
            variant="outline"
            disabled={!nextAudio}
            onClick={() => nextAudio && navigateToAudio(nextAudio.id)}
          >
            Próximo
            <SkipForward className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Estatísticas da Sessão */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="field-card text-center">
            <div className="text-2xl font-bold text-primary mb-1">{sessionCount}</div>
            <p className="text-sm text-muted-foreground">Repetições Hoje</p>
          </div>
          
          <div className="field-card text-center">
            <div className="text-2xl font-bold text-secondary mb-1">{currentIndex + 1}</div>
            <p className="text-sm text-muted-foreground">Áudio Atual</p>
          </div>
          
          <div className="field-card text-center">
            <div className="text-2xl font-bold text-primary mb-1">{field.audios.length}</div>
            <p className="text-sm text-muted-foreground">Total no Campo</p>
          </div>
        </div>

        {/* Próximos Áudios */}
        {nextAudio && (
          <div className="card-gradient rounded-xl p-6 text-center">
            <h3 className="font-semibold mb-2">Próximo áudio:</h3>
            <p className="text-muted-foreground mb-4">{nextAudio.title}</p>
            <Button 
              variant="premium" 
              size="sm"
              onClick={() => navigateToAudio(nextAudio.id)}
            >
              Reproduzir Próximo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}