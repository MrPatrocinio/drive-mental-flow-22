
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Settings, Music, Volume } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { AudioPreferencesPanel } from "@/components/AudioPreferencesPanel";
import { AudioPreferences, audioPreferencesService } from "@/services/audioPreferencesService";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useBackgroundMusic } from "@/hooks/useBackgroundMusic";
import { AudioErrorDisplay } from "@/components/audio/AudioErrorDisplay";
import { AudioLoadingIndicator } from "@/components/audio/AudioLoadingIndicator";
import { useToast } from "@/hooks/use-toast";
import { BackgroundMusicToggle } from "@/components/BackgroundMusicToggle";

interface AudioPlayerProps {
  audioUrl: string;
  title: string;
  onRepeatComplete?: () => void;
}

export const AudioPlayer = ({ audioUrl, title, onRepeatComplete }: AudioPlayerProps) => {
  const [preferences, setPreferences] = useState<AudioPreferences>(audioPreferencesService.getPreferences());
  const [showPreferences, setShowPreferences] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const { toast } = useToast();

  // Background Music Hook
  const {
    state: backgroundMusicState,
    isEnabled: backgroundMusicEnabled,
    toggleEnabled: toggleBackgroundMusic,
    setVolume: setBackgroundVolume,
    setMuted: setBackgroundMuted
  } = useBackgroundMusic();

  const handleError = (error: string) => {
    console.error('Erro no player de áudio:', error);
    toast({
      variant: "destructive",
      title: "Erro no áudio",
      description: error,
    });
  };

  const {
    audioRef,
    playerState,
    repeatCount,
    pauseBetweenRepeats,
    togglePlay,
    reset,
    seek,
    setMuted: setPlayerMuted
  } = useAudioPlayer(audioUrl, preferences, onRepeatComplete, handleError);

  const handleRetry = () => {
    if (audioRef.current) {
      audioRef.current.load();
    }
  };

  const handlePreferencesChange = (newPreferences: AudioPreferences) => {
    setPreferences(newPreferences);
  };

  const handleMuteToggle = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    setPlayerMuted(newMuted);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (value: number[]) => {
    seek(value[0]);
  };

  const handlePlayClick = () => {
    console.log('AudioPlayer: Botão play clicado', {
      isReady: (playerState as any).isReady,
      canPlay: playerState.canPlay,
      hasError: playerState.hasError,
      isLoading: playerState.isLoading
    });
    
    if (!(playerState as any).isReady) {
      toast({
        title: "Aguarde",
        description: "O áudio ainda está carregando. Tente novamente em alguns segundos.",
      });
      return;
    }
    
    togglePlay();
  };

  return (
    <div className="card-gradient rounded-xl p-6 space-y-6">
      <audio ref={audioRef} src={audioUrl} preload="auto" />
      
      <div className="text-center">
        <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
        <div className="text-sm text-muted-foreground">
          Repetições: <span className="text-primary font-semibold">{repeatCount}</span>
        </div>
      </div>

      {/* Loading State */}
      {(playerState.isLoading || !(playerState as any).isReady) && !playerState.hasError && (
        <AudioLoadingIndicator />
      )}

      {/* Error State */}
      {playerState.hasError && playerState.errorMessage && (
        <AudioErrorDisplay 
          error={playerState.errorMessage} 
          onRetry={handleRetry}
        />
      )}

      {/* Progress Bar */}
      {preferences.showProgress && !playerState.hasError && (playerState as any).isReady && (
        <div className="space-y-2">
          <Slider
            value={[playerState.currentTime]}
            max={playerState.duration || 100}
            step={1}
            onValueChange={handleSeek}
            className="w-full"
            disabled={!playerState.canPlay || playerState.isInternalPause}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(playerState.currentTime)}</span>
            <span>{formatTime(playerState.duration)}</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="audio"
          size="audio"
          onClick={reset}
          disabled={playerState.hasError || !(playerState as any).isReady}
        >
          <RotateCcw className="h-5 w-5" />
        </Button>

        <Button
          variant="premium"
          size="audio"
          onClick={handlePlayClick}
          className="w-16 h-16"
          disabled={playerState.hasError || !(playerState as any).isReady}
        >
          {playerState.isPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6 ml-1" />
          )}
        </Button>

        <Button
          variant="audio"
          size="audio"
          onClick={handleMuteToggle}
          disabled={playerState.hasError}
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
        </Button>

        <Button
          variant="audio"
          size="audio"
          onClick={() => setShowPreferences(true)}
        >
          <Settings className="h-5 w-5" />
        </Button>

        {/* Background Music Toggle */}
        <BackgroundMusicToggle />
      </div>

      {/* Status Indicator */}
      {!(playerState as any).isReady && !playerState.hasError && (
        <div className="text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-3 w-3 border-b border-primary"></div>
            <span>Preparando áudio...</span>
          </div>
        </div>
      )}

      {/* Volume Control */}
      <div className="flex items-center gap-3">
        <Volume2 className="h-4 w-4 text-muted-foreground" />
        <Slider
          value={[preferences.volume]}
          max={100}
          step={1}
          onValueChange={(value) => {
            const newVolume = Math.max(1, value[0]);
            const newPreferences = { ...preferences, volume: newVolume };
            setPreferences(newPreferences);
            audioPreferencesService.updatePreferences({ volume: newVolume });
          }}
          className="flex-1"
        />
        <span className="text-xs text-muted-foreground min-w-[3ch]">
          {preferences.volume}%
        </span>
      </div>

      {/* Background Music Status */}
      {backgroundMusicEnabled && (
        <div className="text-center text-xs text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <Music className="h-3 w-3" />
            <span>
              Música de fundo: {backgroundMusicState.isPlaying ? 'Reproduzindo' : 'Pausada'}
              {backgroundMusicState.currentMusic && ` - ${backgroundMusicState.currentMusic.title}`}
            </span>
          </div>
        </div>
      )}

      {/* Repeat Count Display */}
      <div className="text-center text-sm text-muted-foreground">
        {preferences.repeatCount === 0 ? (
          <span>Repetição infinita ativada</span>
        ) : (
          <span>
            Repetições: {repeatCount}/{preferences.repeatCount}
          </span>
        )}
        {pauseBetweenRepeats > 0 && (
          <div className="text-xs text-muted-foreground mt-1">
            Pausa entre repetições: {pauseBetweenRepeats}s
          </div>
        )}
      </div>

      {/* Preferences Panel */}
      <AudioPreferencesPanel
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
        onPreferencesChange={handlePreferencesChange}
      />
    </div>
  );
};
