import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { AudioPlayer } from "@/components/AudioPlayer";
import { FieldService, Field } from "@/services/supabase/fieldService";
import { AudioService, Audio } from "@/services/supabase/audioService";
import { Button } from "@/components/ui/button";
import { RefreshButton } from "@/components/RefreshButton";
import { SkipForward, SkipBack, List } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useDataSync } from "@/hooks/useDataSync";
import { Playlist } from "@/services/playlistService";

import * as Icons from "lucide-react";

export default function AudioPlayerPage() {
  const { fieldId, audioId } = useParams<{ fieldId: string; audioId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [sessionCount, setSessionCount] = useState(0);
  const [field, setField] = useState<Field | null>(null);
  const [audios, setAudios] = useState<Audio[]>([]);
  const [audio, setAudio] = useState<Audio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estado da playlist se veio pelo navigation state
  const playlistState = location.state as { playlist?: Playlist; currentIndex?: number } | null;
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(playlistState?.currentIndex || 0);
  const isPlaylistMode = !!playlistState?.playlist;

  const loadData = useCallback(async () => {
    if (!audioId) return;
    
    setIsLoading(true);
    try {
      // Se está em modo playlist, usa os dados da playlist
      if (isPlaylistMode && playlistState?.playlist) {
        const playlistAudio = playlistState.playlist.audios[currentPlaylistIndex];
        if (playlistAudio) {
          // Simula um objeto Audio baseado nos dados da playlist
          const audioFromPlaylist: Audio = {
            id: playlistAudio.id,
            title: playlistAudio.title,
            duration: playlistAudio.duration,
            url: "", // Precisaria buscar a URL real do áudio
            field_id: playlistAudio.fieldId,
            tags: [],
            is_premium: false, // Default para playlist
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          // Busca o áudio real pelo ID para ter a URL
          try {
            const realAudio = await AudioService.getById(playlistAudio.id);
            if (realAudio) {
              setAudio(realAudio);
            } else {
              setAudio(audioFromPlaylist);
            }
          } catch {
            setAudio(audioFromPlaylist);
          }
          
          setField({ 
            id: '', 
            title: playlistState.playlist.name, 
            description: playlistState.playlist.description || 'Playlist personalizada',
            icon_name: 'Music',
            audio_count: playlistState.playlist.audios.length,
            display_order: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          setAudios([audioFromPlaylist]); // Para manter compatibilidade
        }
      } 
      // Modo tradicional com field
      else if (fieldId) {
        const [fieldData, audiosData] = await Promise.all([
          FieldService.getById(fieldId),
          AudioService.getByField(fieldId)
        ]);

        if (!fieldData) {
          setField(null);
          setAudios([]);
          setAudio(null);
          return;
        }

        setField(fieldData);
        setAudios(audiosData);
        
        const foundAudio = audiosData.find(a => a.id === audioId);
        setAudio(foundAudio || null);
      }
      // Modo direto para áudio individual
      else {
        try {
          const audioData = await AudioService.getById(audioId);
          if (audioData) {
            setAudio(audioData);
            // Tenta buscar o field do áudio
            try {
              const fieldData = await FieldService.getById(audioData.field_id);
              setField(fieldData);
            } catch {
              setField({
                id: audioData.field_id,
                title: 'Áudio',
                description: 'Reprodução individual',
                icon_name: 'Music',
                audio_count: 1,
                display_order: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            }
            setAudios([audioData]);
          }
        } catch (error) {
          console.error('Erro ao carregar áudio:', error);
          setAudio(null);
          setField(null);
          setAudios([]);
        }
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setField(null);
      setAudios([]);
      setAudio(null);
    } finally {
      setIsLoading(false);
    }
  }, [fieldId, audioId, isPlaylistMode, playlistState, currentPlaylistIndex]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSyncEvent = useCallback(() => {
    loadData();
  }, [loadData]);

  useDataSync({
    onAudiosChange: handleSyncEvent,
    onFieldsChange: handleSyncEvent
  });
  
  if (isLoading) {
    return (
      <div className="min-h-screen hero-gradient">
        <Header showBackButton />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-muted rounded-2xl mx-auto mb-6"></div>
            <div className="h-8 bg-muted rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-muted rounded w-96 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

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

  // Lógica de navegação adaptada para playlist ou field
  let currentIndex = 0;
  let nextAudio = null;
  let prevAudio = null;
  
  if (isPlaylistMode && playlistState?.playlist) {
    currentIndex = currentPlaylistIndex;
    const playlist = playlistState.playlist;
    nextAudio = currentIndex < playlist.audios.length - 1 ? playlist.audios[currentIndex + 1] : null;
    prevAudio = currentIndex > 0 ? playlist.audios[currentIndex - 1] : null;
  } else {
    currentIndex = audios.findIndex(a => a.id === audioId);
    nextAudio = currentIndex < audios.length - 1 ? audios[currentIndex + 1] : null;
    prevAudio = currentIndex > 0 ? audios[currentIndex - 1] : null;
  }

  const FieldIcon = (Icons as any)[field?.icon_name || 'Music'] || Icons.Circle;

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
    if (isPlaylistMode && playlistState?.playlist) {
      const newIndex = playlistState.playlist.audios.findIndex(a => a.id === targetAudioId);
      if (newIndex !== -1) {
        navigate(`/audio/${targetAudioId}`, {
          state: {
            playlist: playlistState.playlist,
            currentIndex: newIndex
          }
        });
      }
    } else if (fieldId) {
      navigate(`/campo/${fieldId}/audio/${targetAudioId}`);
    } else {
      navigate(`/audio/${targetAudioId}`);
    }
  };

  return (
    <div className="min-h-screen hero-gradient">
      <Header showBackButton title={field.title} />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header do Áudio */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <FieldIcon className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{audio.title}</h1>
          <p className="text-muted-foreground text-lg">{field.description}</p>
          <div className="flex items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
            <span>Áudio {currentIndex + 1} de {isPlaylistMode ? playlistState?.playlist?.audios.length : audios.length}</span>
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
            onClick={() => {
              if (isPlaylistMode) {
                navigate('/dashboard');
              } else {
                navigate(`/campo/${fieldId}`);
              }
            }}
          >
            <List className="h-4 w-4 mr-2" />
            {isPlaylistMode ? 'Ver Playlists' : 'Ver Lista'}
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
            <div className="text-2xl font-bold text-primary mb-1">{isPlaylistMode ? playlistState?.playlist?.audios.length : audios.length}</div>
            <p className="text-sm text-muted-foreground">{isPlaylistMode ? 'Total na Playlist' : 'Total no Campo'}</p>
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
