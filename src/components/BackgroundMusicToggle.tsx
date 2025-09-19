/**
 * Background Music Toggle Button Component
 * Responsabilidade: Removido - música de fundo sempre habilitada
 * Princípio SRP: Componente desabilitado para usuário final
 */

import React from 'react';

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
  // Componente não deve ser exibido - música de fundo sempre habilitada sem controle do usuário
  return null;
};