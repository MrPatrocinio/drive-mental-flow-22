
/**
 * First Visit Music Prompt Component
 * Responsabilidade: Prompt inicial para ativar música de fundo
 * Princípio SRP: Apenas interface para primeira escolha de música
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, VolumeX } from 'lucide-react';
import { audioPreferencesService } from '@/services/audioPreferencesService';
import { useToast } from '@/hooks/use-toast';

interface FirstVisitMusicPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onMusicEnabled: (enabled: boolean) => void;
}

export const FirstVisitMusicPrompt = ({ 
  isOpen, 
  onClose, 
  onMusicEnabled 
}: FirstVisitMusicPromptProps) => {
  const { toast } = useToast();

  const handleChoice = (enableMusic: boolean) => {
    console.log('FirstVisitMusicPrompt: Usuário escolheu música de fundo:', enableMusic);
    
    audioPreferencesService.updatePreferences({ 
      backgroundMusicEnabled: enableMusic,
      isFirstVisit: false 
    });
    
    onMusicEnabled(enableMusic);
    onClose();

    toast({
      title: enableMusic ? "Música de fundo ativada" : "Música de fundo desativada",
      description: enableMusic 
        ? "Você pode alterar isso a qualquer momento nas configurações de áudio."
        : "Você pode ativar a música de fundo a qualquer momento.",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-center">
            <Music className="h-5 w-5" />
            Música de Fundo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center text-muted-foreground">
            <p>Deseja ativar música relaxante de fundo durante sua experiência?</p>
            <p className="text-sm mt-2">Você pode alterar essa preferência a qualquer momento.</p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => handleChoice(false)}
              className="flex-1 flex items-center gap-2"
            >
              <VolumeX className="h-4 w-4" />
              Não, obrigado
            </Button>
            <Button
              onClick={() => handleChoice(true)}
              className="flex-1 flex items-center gap-2"
            >
              <Music className="h-4 w-4" />
              Sim, ativar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
