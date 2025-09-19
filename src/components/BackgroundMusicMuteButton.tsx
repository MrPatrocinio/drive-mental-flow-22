/**
 * Background Music Mute Button Component
 * Responsabilidade: Botão simples para mute/unmute da música de fundo
 * Princípio SRP: Apenas controle de mute da música de fundo
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { useBackgroundMusic } from '@/hooks/useBackgroundMusic';

interface BackgroundMusicMuteButtonProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "audio";
}

export const BackgroundMusicMuteButton = ({ 
  className = "", 
  size = 'md',
  showStatus = false,
  variant = "outline"
}: BackgroundMusicMuteButtonProps) => {
  const {
    state,
    isEnabled,
    setMuted
  } = useBackgroundMusic();

  const [isMuted, setIsMutedState] = React.useState(false);

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
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant={variant}
        size={buttonSize}
        onClick={handleMuteToggle}
        disabled={!state.currentMusic}
        title={isMuted ? "Ativar música de fundo" : "Silenciar música de fundo"}
      >
        {isMuted ? (
          <VolumeX className={iconSize} />
        ) : (
          <Volume2 className={iconSize} />
        )}
      </Button>

      {showStatus && state.currentMusic && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Music className="h-3 w-3" />
          {state.isPlaying && !isMuted ? (
            <span className="text-green-600">Reproduzindo</span>
          ) : (
            <span className="text-orange-600">Pausada</span>
          )}
        </div>
      )}
    </div>
  );
};