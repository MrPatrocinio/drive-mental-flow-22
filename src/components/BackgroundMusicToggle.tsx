/**
 * Background Music Toggle Button Component
 * Responsabilidade: Botão standalone para controle de música de fundo
 * Princípio SRP: Apenas toggle de música de fundo
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Music, Volume } from 'lucide-react';
import { useBackgroundMusic } from '@/hooks/useBackgroundMusic';

interface BackgroundMusicToggleProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "audio";
  size?: "default" | "sm" | "lg" | "icon" | "audio";
  className?: string;
}

export const BackgroundMusicToggle = ({ 
  variant = "audio", 
  size = "audio",
  className = ""
}: BackgroundMusicToggleProps) => {
  const {
    isEnabled: backgroundMusicEnabled,
    toggleEnabled: toggleBackgroundMusic,
    state: backgroundMusicState
  } = useBackgroundMusic();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => toggleBackgroundMusic(!backgroundMusicEnabled)}
      className={`${backgroundMusicEnabled ? "bg-primary/20" : ""} ${className}`}
      title={backgroundMusicEnabled ? "Desativar música de fundo" : "Ativar música de fundo"}
    >
      {backgroundMusicEnabled ? (
        <Music className="h-5 w-5 text-primary" />
      ) : (
        <Volume className="h-5 w-5" />
      )}
    </Button>
  );
};