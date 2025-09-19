/**
 * Background Music Mute Button Component
 * Responsabilidade: Removido - música de fundo sempre habilitada sem controle do usuário
 * Princípio SRP: Componente desabilitado para usuário final
 */

import React from 'react';

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
  // Componente não deve ser exibido - música de fundo sempre habilitada sem controle do usuário
  return null;
};