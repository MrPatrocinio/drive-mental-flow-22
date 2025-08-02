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
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { VideoControls } from '@/services/supabase/videoService';
import { 
  VideoControlsValidationService, 
  ValidationWarning 
} from '@/services/videoControlsValidationService';
import { 
  Play, 
  Volume2, 
  SkipForward, 
  Maximize, 
  Keyboard, 
  Settings, 
  PlayCircle, 
  VolumeX,
  AlertTriangle,
  Info,
  CheckCircle,
  Zap
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
  const validation = VideoControlsValidationService.validateAndCorrect(controls);
  const presets = VideoControlsValidationService.getPresets();

  const handleControlChange = (key: keyof VideoControls, value: boolean) => {
    // Aplica auto-correção inteligente
    const correctedControls = VideoControlsValidationService.applySmartCorrection(
      controls, 
      key, 
      value
    );
    onChange(correctedControls);
  };

  const handlePresetApply = (presetKey: string) => {
    const preset = presets[presetKey];
    if (preset) {
      onChange(preset.controls);
    }
  };

  const getWarningIcon = (type: ValidationWarning['type']) => {
    switch (type) {
      case 'critical': return AlertTriangle;
      case 'warning': return Info;
      case 'info': return CheckCircle;
      default: return Info;
    }
  };

  const getWarningColor = (type: ValidationWarning['type']) => {
    switch (type) {
      case 'critical': return 'border-red-200 bg-red-50 text-red-800';
      case 'warning': return 'border-amber-200 bg-amber-50 text-amber-800';
      case 'info': return 'border-blue-200 bg-blue-50 text-blue-800';
      default: return 'border-gray-200 bg-gray-50 text-gray-800';
    }
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
        {/* Presets de Configuração */}
        <div>
          <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">
            Configurações Predefinidas
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(presets).map(([key, preset]) => (
              <Button
                key={key}
                variant="outline"
                size="sm"
                onClick={() => handlePresetApply(key)}
                disabled={disabled}
                className="text-xs h-auto p-2 flex flex-col items-start"
              >
                <span className="font-medium">{preset.name}</span>
                <span className="text-muted-foreground">{preset.description}</span>
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Alertas de Validação */}
        {validation.warnings.length > 0 && (
          <div className="space-y-2">
            {validation.warnings.map((warning, index) => {
              const IconComponent = getWarningIcon(warning.type);
              return (
                <Alert key={index} className={getWarningColor(warning.type)}>
                  <IconComponent className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    {warning.autoCorrect && <Zap className="inline h-3 w-3 mr-1" />}
                    {warning.message}
                  </AlertDescription>
                </Alert>
              );
            })}
          </div>
        )}

        {validation.warnings.length > 0 && <Separator />}
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

        {/* Status da Configuração */}
        <div className={`rounded-lg p-3 border ${
          validation.isValid 
            ? 'bg-green-50 border-green-200' 
            : 'bg-amber-50 border-amber-200'
        }`}>
          <div className="flex items-center gap-2 mb-1">
            {validation.isValid ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            )}
            <p className={`text-sm font-medium ${
              validation.isValid ? 'text-green-800' : 'text-amber-800'
            }`}>
              {validation.isValid ? 'Configuração Válida' : 'Atenção Necessária'}
            </p>
          </div>
          <p className={`text-xs ${
            validation.isValid ? 'text-green-600' : 'text-amber-600'
          }`}>
            {validation.isValid 
              ? 'Todas as configurações estão compatíveis para uma boa experiência do usuário.'
              : 'Algumas configurações podem prejudicar a experiência do usuário.'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};