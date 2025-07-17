/**
 * Drive Mental Config Panel - Interface para configuração de drives mentais
 * Responsabilidade: UI para configuração de programação de drives
 * Princípio SRP: Apenas interface de configuração
 * Princípio DRY: Componente reutilizável
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Play, Settings, Volume2, Repeat, Clock } from "lucide-react";
import { DriveMentalProgrammingService, DriveMentalConfig } from "@/services/driveMentalProgrammingService";
import { useToast } from "@/hooks/use-toast";

interface DriveMentalConfigPanelProps {
  audioId: string;
  fieldId: string;
  audioTitle: string;
  onStartSession: (config: DriveMentalConfig) => void;
  onClose: () => void;
}

export function DriveMentalConfigPanel({
  audioId,
  fieldId,
  audioTitle,
  onStartSession,
  onClose
}: DriveMentalConfigPanelProps) {
  const { toast } = useToast();
  const [config, setConfig] = useState<DriveMentalConfig>(() => 
    DriveMentalProgrammingService.getConfig(fieldId, audioId) || 
    DriveMentalProgrammingService.getDefaultConfig(fieldId, audioId)
  );

  const handleConfigChange = (updates: Partial<DriveMentalConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const handleSaveAndStart = () => {
    try {
      DriveMentalProgrammingService.saveConfig(config);
      onStartSession(config);
      toast({
        title: "Sessão iniciada",
        description: `Drive mental "${audioTitle}" programado com sucesso`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar configuração",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6 space-y-6 max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Programar Drive Mental</h3>
            <p className="text-sm text-muted-foreground">{audioTitle}</p>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        {/* Nome da Sessão */}
        <div className="space-y-2">
          <Label htmlFor="sessionName">Nome da Sessão</Label>
          <Input
            id="sessionName"
            value={config.sessionName || ''}
            onChange={(e) => handleConfigChange({ sessionName: e.target.value })}
            placeholder="Digite um nome para a sessão"
          />
        </div>

        {/* Repetições */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Repeat className="h-4 w-4" />
            Repetições: {config.repetitions || 1}
          </Label>
          <Slider
            value={[config.repetitions || 1]}
            onValueChange={([value]) => handleConfigChange({ repetitions: value })}
            min={1}
            max={10}
            step={1}
            className="w-full"
          />
        </div>

        {/* Duração (alternativa às repetições) */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Duração (minutos): {config.duration || 'Indefinida'}
          </Label>
          <Slider
            value={[config.duration || 0]}
            onValueChange={([value]) => handleConfigChange({ 
              duration: value === 0 ? undefined : value,
              repetitions: value > 0 ? undefined : config.repetitions
            })}
            min={0}
            max={120}
            step={5}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            0 = usar repetições, &gt;0 = usar duração em minutos
          </p>
        </div>

        {/* Volume */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            Volume: {Math.round((config.volume || 0.8) * 100)}%
          </Label>
          <Slider
            value={[(config.volume || 0.8) * 100]}
            onValueChange={([value]) => handleConfigChange({ volume: value / 100 })}
            min={10}
            max={100}
            step={5}
            className="w-full"
          />
        </div>

        {/* Auto Play */}
        <div className="flex items-center justify-between">
          <Label htmlFor="autoplay" className="text-sm font-medium">
            Iniciar automaticamente
          </Label>
          <Switch
            id="autoplay"
            checked={config.autoPlay}
            onCheckedChange={(checked) => handleConfigChange({ autoPlay: checked })}
          />
        </div>
      </div>

      <Separator />

      <div className="flex gap-3">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Cancelar
        </Button>
        <Button onClick={handleSaveAndStart} className="flex-1">
          <Play className="h-4 w-4 mr-2" />
          Iniciar Sessão
        </Button>
      </div>
    </Card>
  );
}