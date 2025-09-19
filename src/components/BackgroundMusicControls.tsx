/**
 * Background Music Controls Component
 * Responsabilidade: Controles independentes para música de fundo
 * Princípio SRP: Apenas controles de música de fundo
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Music, Volume2, VolumeX } from 'lucide-react';
import { useBackgroundMusic } from '@/hooks/useBackgroundMusic';
import { backgroundMusicPlayer } from '@/services/backgroundMusicPlayerService';

interface BackgroundMusicControlsProps {
  className?: string;
  showTitle?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const BackgroundMusicControls = ({ 
  className = "", 
  showTitle = true,
  size = 'md' 
}: BackgroundMusicControlsProps) => {
  const {
    state,
    isEnabled,
    toggleEnabled,
    setVolume,
    setMuted
  } = useBackgroundMusic();

  const [localVolume, setLocalVolume] = React.useState(state.volume * 100);
  const [isMuted, setIsMutedState] = React.useState(false);

  // Sincroniza volume local com estado do player
  React.useEffect(() => {
    setLocalVolume(state.volume * 100);
  }, [state.volume]);

  const handlePlayPause = async () => {
    if (state.isPlaying) {
      backgroundMusicPlayer.pause();
    } else {
      await backgroundMusicPlayer.play();
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setLocalVolume(newVolume);
    setVolume(newVolume / 100);
  };

  const handleMuteToggle = () => {
    const newMuted = !isMuted;
    setIsMutedState(newMuted);
    setMuted(newMuted);
  };

  const buttonSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default';
  const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-6 w-6' : 'h-4 w-4';

  if (!isEnabled) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {showTitle && (
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Music className="h-4 w-4" />
          Música de Fundo
          {state.currentMusic?.id === 'fallback' && (
            <span className="text-orange-600 text-xs">(Local)</span>
          )}
        </div>
      )}

      {/* Play/Pause e Mute Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size={buttonSize}
          onClick={handlePlayPause}
          disabled={state.isLoading || (!state.currentMusic && !state.isLoading)}
          title={state.isPlaying ? "Pausar música de fundo" : "Tocar música de fundo"}
        >
          {state.isLoading ? (
            <div className={`${iconSize} animate-spin rounded-full border-2 border-gray-300 border-t-gray-600`} />
          ) : state.isPlaying ? (
            <Pause className={iconSize} />
          ) : (
            <Play className={iconSize} />
          )}
        </Button>

        <Button
          variant="outline"
          size={buttonSize}
          onClick={handleMuteToggle}
          disabled={!state.currentMusic}
          title={isMuted ? "Ativar som" : "Silenciar"}
        >
          {isMuted ? (
            <VolumeX className={iconSize} />
          ) : (
            <Volume2 className={iconSize} />
          )}
        </Button>

        {/* Informações da música atual */}
        {state.currentMusic && (
          <div className="flex-1 min-w-0">
            <div className="text-xs text-muted-foreground truncate">
              {state.currentMusic.title}
            </div>
            {state.isPlaying && (
              <div className="text-xs text-green-600">
                ♪ Reproduzindo
              </div>
            )}
          </div>
        )}
      </div>

      {/* Volume Slider */}
      <div className="flex items-center gap-3">
        <Volume2 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
        <Slider
          value={[localVolume]}
          max={100}
          step={1}
          onValueChange={handleVolumeChange}
          className="flex-1"
          disabled={!state.currentMusic || isMuted}
        />
        <span className="text-xs text-muted-foreground min-w-[3ch]">
          {Math.round(localVolume)}%
        </span>
      </div>

      {/* Status/Error Display */}
      {state.hasError && (
        <div className="text-xs text-red-600">
          Erro ao carregar música
        </div>
      )}
      
      {!state.currentMusic && !state.isLoading && (
        <div className="text-xs text-muted-foreground">
          Nenhuma música disponível
        </div>
      )}
    </div>
  );
};