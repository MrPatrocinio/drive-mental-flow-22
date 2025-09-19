import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Settings, Volume2, Repeat, Play, RotateCcw, Music } from "lucide-react";
import { AudioPreferences, audioPreferencesService } from "@/services/audioPreferencesService";

interface AudioPreferencesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onPreferencesChange: (preferences: AudioPreferences) => void;
}

export const AudioPreferencesPanel = ({ 
  isOpen, 
  onClose, 
  onPreferencesChange 
}: AudioPreferencesPanelProps) => {
  const [preferences, setPreferences] = useState(audioPreferencesService.getPreferences());

  const handlePreferenceChange = (updates: Partial<AudioPreferences>) => {
    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);
    audioPreferencesService.updatePreferences(updates);
    onPreferencesChange(newPreferences);
  };

  const handleReset = () => {
    audioPreferencesService.resetToDefaults();
    const defaultPrefs = audioPreferencesService.getPreferences();
    setPreferences(defaultPrefs);
    onPreferencesChange(defaultPrefs);
  };

  const handleRepeatCountChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0) {
      handlePreferenceChange({ repeatCount: numValue });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações de Áudio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Volume */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Volume ({preferences.volume}%)
            </Label>
            <Slider
              value={[preferences.volume]}
              max={100}
              step={1}
              onValueChange={(value) => handlePreferenceChange({ volume: value[0] })}
              className="w-full"
            />
          </div>

          {/* Repeat Count */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Repeat className="h-4 w-4" />
              Número de Repetições
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                value={preferences.repeatCount}
                onChange={(e) => handleRepeatCountChange(e.target.value)}
                placeholder="0 = infinito"
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground">
                {preferences.repeatCount === 0 ? "∞" : preferences.repeatCount}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              0 = repetição infinita, qualquer número maior que 0 = repetições específicas
            </p>
          </div>

          {/* Auto Play */}
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Reproduzir Automaticamente
            </Label>
            <Switch
              checked={preferences.autoPlay}
              onCheckedChange={(checked) => handlePreferenceChange({ autoPlay: checked })}
            />
          </div>

          {/* Show Progress */}
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <div className="h-4 w-4 bg-primary rounded-full" />
              Mostrar Progresso
            </Label>
            <Switch
              checked={preferences.showProgress}
              onCheckedChange={(checked) => handlePreferenceChange({ showProgress: checked })}
            />
          </div>

          {/* Informação sobre música de fundo */}
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Music className="h-4 w-4" />
              <span>Música de fundo configurada automaticamente</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Resetar
            </Button>
            <Button onClick={onClose} className="flex-1">
              Fechar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};