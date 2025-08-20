
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Settings, Music, Volume, Wifi } from "lucide-react";
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
    retryCount,
    isValidatingUrl,
    togglePlay,
    reset,
    seek,
    setMuted: setPlayerMuted,
    validateAudioUrl,
    retryInitialization
  } = useAudioPlayer(audioUrl, preferences, onRepeatComplete, handleError);

  const handleRetry = async () => {
    console.log('AudioPlayer: Tentativa de retry solicitada');
    if (audioRef.current) {
      audioRef.current.load();
    }
    await retryInitialization();
  };

  const handleValidateUrl = async () => {
    console.log('AudioPlayer: Validação de URL solicitada');
    await validateAudioUrl();
  };

  const handlePreferencesChange = (newPreferences: AudioPreferences) => {
    setPreferences(newPreferences);
  };

  const handleMuteToggle = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    setPlayerMuted(newMuted);
  };

  // Função de formatação de tempo
  const formatTime = (time: number) => {
    if (!time || isNaN(time) || !isFinite(time) || time < 0) {
      return '0:00';
    }
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (value: number[]) => {
    seek(value[0]);
  };

  const handlePlayClick = async () => {
    console.log('AudioPlayer: Botão play clicado', {
      isReady: playerState.isReady,
      canPlay: playerState.canPlay,
      hasError: playerState.hasError,
      isLoading: playerState.isLoading,
      isPlaying: playerState.isPlaying,
      retryCount,
      isValidatingUrl
    });
    
    if (!playerState.isReady) {
      let message = "O áudio ainda está carregando. Aguarde alguns segundos e tente novamente.";
      let variant: "default" | "destructive" = "default";
      
      if (playerState.hasError) {
        message = retryCount < 3 
          ? "Erro no áudio. Tentando reconectar automaticamente..." 
          : "Erro persistente no áudio. Tente recarregar a página.";
        variant = "destructive";
      } else if (playerState.isLoading || isValidatingUrl) {
        message = isValidatingUrl ? "Validando áudio..." : "Carregando áudio, aguarde...";
      }
        
      toast({
        title: playerState.hasError ? "Erro" : "Aguarde",
        description: message,
        variant
      });
      return;
    }
    
    try {
      await togglePlay();
      console.log('AudioPlayer: Toggle play executado com sucesso');
    } catch (error) {
      console.error('AudioPlayer: Erro no play:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao reproduzir o áudio. Tente novamente.",
      });
    }
  };

  // Estado de loading melhorado
  const showLoadingState = playerState.isLoading || isValidatingUrl;

  return (
    <div className="card-gradient rounded-xl p-6 space-y-6">
      <audio ref={audioRef} src={audioUrl} preload="auto" crossOrigin="anonymous" />
      
      <div className="text-center">
        <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
        <div className="text-sm text-muted-foreground">
          Repetições: <span className="text-primary font-semibold">{repeatCount}</span>
          {retryCount > 0 && (
            <span className="ml-2 text-orange-600">
              (Tentativa {retryCount}/3)
            </span>
          )}
        </div>
      </div>

      {/* Loading State */}
      {showLoadingState && (
        <div className="text-center py-4">
          <AudioLoadingIndicator />
          <div className="mt-2 text-sm text-muted-foreground">
            {isValidatingUrl ? 'Validando áudio...' : 'Carregando áudio...'}
          </div>
        </div>
      )}

      {/* Error State - MELHORADO */}
      {playerState.hasError && playerState.errorMessage && (
        <AudioErrorDisplay 
          error={playerState.errorMessage} 
          onRetry={handleRetry}
          onValidateUrl={handleValidateUrl}
          showValidateButton={retryCount >= 2}
        />
      )}

      {/* Progress Bar */}
      {preferences.showProgress && playerState.canPlay && !showLoadingState && (
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
          disabled={!playerState.canPlay || showLoadingState}
        >
          <RotateCcw className="h-5 w-5" />
        </Button>

        <Button
          variant="premium"
          size="audio"
          onClick={handlePlayClick}
          className="w-16 h-16"
          disabled={showLoadingState && !playerState.hasError}
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
          disabled={!playerState.canPlay || showLoadingState}
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

        <BackgroundMusicToggle />
      </div>

      {/* Volume Control */}
      {playerState.canPlay && !showLoadingState && (
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
      )}

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
      {playerState.canPlay && !showLoadingState && (
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
      )}

      {/* Preferences Panel */}
      <AudioPreferencesPanel
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
        onPreferencesChange={handlePreferencesChange}
      />
    </div>
  );
};
