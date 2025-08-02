/**
 * VideoControlsPanel - Painel de configuração de controles de vídeo
 * Responsabilidade: UI para configuração granular de controles de vídeo
 * Princípio SRP: Apenas interface para controles de vídeo
 * Princípio DRY: Componente reutilizável para qualquer vídeo
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { VideoControls } from '@/services/supabase/videoService';
import { 
  Play, 
  Volume2, 
  SkipForward, 
  Maximize, 
  Keyboard, 
  Settings, 
  PlayCircle, 
  VolumeX 
} from 'lucide-react';

interface VideoControlsPanelProps {
  controls: VideoControls;
  onChange: (controls: VideoControls) => void;
  disabled?: boolean;
}

export const VideoControlsPanel: React.FC<VideoControlsPanelProps> = ({
  controls,
  onChange,
  disabled = false
}) => {
  const handleControlChange = (key: keyof VideoControls, value: boolean) => {
    onChange({
      ...controls,
      [key]: value
    });
  };

  const controlItems = [
    {
      key: 'showControls' as keyof VideoControls,
      label: 'Exibir Controles',
      description: 'Mostrar a barra de controles do YouTube',
      icon: Settings
    },
    {
      key: 'allowPause' as keyof VideoControls,
      label: 'Permitir Pausar',
      description: 'Permitir que o usuário pause/despause o vídeo',
      icon: Play
    },
    {
      key: 'allowVolumeControl' as keyof VideoControls,
      label: 'Controle de Volume',
      description: 'Permitir ajustar o volume do vídeo',
      icon: Volume2
    },
    {
      key: 'allowSeek' as keyof VideoControls,
      label: 'Avançar/Retroceder',
      description: 'Permitir navegar pela linha do tempo',
      icon: SkipForward
    },
    {
      key: 'allowFullscreen' as keyof VideoControls,
      label: 'Tela Cheia',
      description: 'Permitir visualização em tela cheia',
      icon: Maximize
    },
    {
      key: 'allowKeyboardControls' as keyof VideoControls,
      label: 'Controles de Teclado',
      description: 'Permitir controle via teclas (espaço, setas, etc.)',
      icon: Keyboard
    }
  ];

  const playbackItems = [
    {
      key: 'autoplay' as keyof VideoControls,
      label: 'Reprodução Automática',
      description: 'Iniciar o vídeo automaticamente',
      icon: PlayCircle
    },
    {
      key: 'muted' as keyof VideoControls,
      label: 'Iniciar Mutado',
      description: 'Começar com o som desligado',
      icon: VolumeX
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Controles do Vídeo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controles de Interação */}
        <div>
          <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">
            Controles de Interação
          </h4>
          <div className="space-y-4">
            {controlItems.map(({ key, label, description, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={key} className="text-sm font-medium">
                      {label}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </div>
                <Switch
                  id={key}
                  checked={controls[key]}
                  onCheckedChange={(checked) => handleControlChange(key, checked)}
                  disabled={disabled}
                />
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Configurações de Reprodução */}
        <div>
          <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">
            Configurações de Reprodução
          </h4>
          <div className="space-y-4">
            {playbackItems.map(({ key, label, description, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={key} className="text-sm font-medium">
                      {label}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </div>
                <Switch
                  id={key}
                  checked={controls[key]}
                  onCheckedChange={(checked) => handleControlChange(key, checked)}
                  disabled={disabled}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Indicador de Restrições Ativas */}
        {Object.values(controls).some(value => !value) && (
          <>
            <Separator />
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800 font-medium mb-1">
                ⚠️ Restrições Ativas
              </p>
              <p className="text-xs text-amber-600">
                Algumas funcionalidades do vídeo estarão desabilitadas para os usuários.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};