
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { AudioConfigService, AudioConfig } from '@/services/supabase/audioConfigService';
import { useToast } from '@/hooks/use-toast';
import { Clock, Save, RefreshCw } from 'lucide-react';

/**
 * Painel administrativo para configuração de áudio
 * Segue princípio SRP: apenas UI para configuração de áudio
 * Segue princípio de separação UI/lógica: usa AudioConfigService
 */
export const AudioConfigPanel: React.FC = () => {
  const [config, setConfig] = useState<AudioConfig>({ pause_between_repeats_seconds: 3 });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Carrega configuração atual
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const audioConfig = await AudioConfigService.getAudioConfig();
      setConfig(audioConfig);
      console.log('AudioConfigPanel: Configuração carregada:', audioConfig);
    } catch (error) {
      console.error('AudioConfigPanel: Erro ao carregar configuração:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar configuração",
        description: "Não foi possível carregar as configurações de áudio."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await AudioConfigService.updateAudioConfig(config);
      
      if (result.success) {
        toast({
          title: "Configuração salva!",
          description: `Pausa entre repetições definida para ${config.pause_between_repeats_seconds} segundos.`
        });
        console.log('AudioConfigPanel: Configuração salva com sucesso');
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao salvar",
          description: result.error || "Erro desconhecido"
        });
      }
    } catch (error) {
      console.error('AudioConfigPanel: Erro ao salvar configuração:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar configuração",
        description: "Não foi possível salvar as configurações."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePauseChange = (value: number[]) => {
    setConfig(prev => ({
      ...prev,
      pause_between_repeats_seconds: value[0]
    }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Configurações de Áudio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Carregando...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Configurações de Áudio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="text-sm font-medium mb-4">Pausa Entre Repetições</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Define quantos segundos de pausa haverá entre cada repetição do áudio principal. 
            A música de fundo continua tocando normalmente durante esta pausa.
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground min-w-[4ch]">2s</span>
              <Slider
                value={[config.pause_between_repeats_seconds]}
                onValueChange={handlePauseChange}
                min={2}
                max={6}
                step={0.5}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground min-w-[4ch]">6s</span>
            </div>
            
            <div className="text-center">
              <span className="text-lg font-semibold text-primary">
                {config.pause_between_repeats_seconds}s
              </span>
              <p className="text-xs text-muted-foreground">
                Pausa atual entre repetições
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={loadConfig}
            disabled={isLoading || isSaving}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Recarregar
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="min-w-[100px]"
          >
            {isSaving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
          <h5 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            💡 Como funciona
          </h5>
          <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Quando um áudio principal termina, há uma pausa antes da próxima repetição</li>
            <li>• Durante esta pausa, a música de fundo continua tocando normalmente</li>
            <li>• O usuário vê um indicador "Pausando..." durante este período</li>
            <li>• A configuração se aplica globalmente a todos os áudios principais</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
