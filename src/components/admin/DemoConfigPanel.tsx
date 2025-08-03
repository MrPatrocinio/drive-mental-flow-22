/**
 * DemoConfigPanel - Componente para configurar áudio de demonstração
 * Responsabilidade: Interface para seleção de áudio demo
 * Princípio SRP: Apenas UI de configuração de demo
 * Princípio DRY: Componente reutilizável
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Play, Settings, CheckCircle } from 'lucide-react';
import { DemoService, DemoConfig, DemoAudio } from '@/services/supabase/demoService';
import { toast } from 'sonner';

export const DemoConfigPanel: React.FC = () => {
  const [config, setConfig] = useState<DemoConfig | null>(null);
  const [availableAudios, setAvailableAudios] = useState<DemoAudio[]>([]);
  const [currentDemoAudio, setCurrentDemoAudio] = useState<DemoAudio | null>(null);
  const [selectedAudioId, setSelectedAudioId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [demoConfig, audios, demoAudio] = await Promise.all([
        DemoService.getDemoConfig(),
        DemoService.getAvailableAudios(),
        DemoService.getDemoAudio()
      ]);

      setConfig(demoConfig);
      setAvailableAudios(audios);
      setCurrentDemoAudio(demoAudio);
      setSelectedAudioId(demoConfig.demo_audio_id || '');
    } catch (error) {
      console.error('Error loading demo data:', error);
      toast.error('Erro ao carregar dados de demonstração');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDemo = async () => {
    if (!config) return;

    try {
      setSaving(true);
      await DemoService.setDemoAudio(selectedAudioId || null);
      
      // Recarregar dados para atualizar estado
      await loadData();
      
      toast.success('Áudio de demonstração atualizado com sucesso!');
    } catch (error) {
      console.error('Error saving demo config:', error);
      toast.error('Erro ao salvar configuração de demonstração');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveDemo = async () => {
    try {
      setSaving(true);
      await DemoService.setDemoAudio(null);
      
      // Recarregar dados para atualizar estado
      await loadData();
      
      toast.success('Demonstração removida com sucesso!');
    } catch (error) {
      console.error('Error removing demo:', error);
      toast.error('Erro ao remover demonstração');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuração de Demonstração
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuração de Demonstração
        </CardTitle>
        <CardDescription>
          Configure qual áudio será usado como demonstração gratuita para visitantes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Atual */}
        <div className="space-y-3">
          <h4 className="font-medium">Status Atual</h4>
          {currentDemoAudio ? (
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium">{currentDemoAudio.title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline">{currentDemoAudio.field_title}</Badge>
                    <span>•</span>
                    <span>{currentDemoAudio.duration}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveDemo}
                  disabled={saving}
                >
                  Remover
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 border rounded-lg border-dashed">
              <p className="text-sm text-muted-foreground text-center">
                Nenhum áudio configurado como demonstração
              </p>
            </div>
          )}
        </div>

        {/* Seleção de Novo Áudio */}
        <div className="space-y-3">
          <h4 className="font-medium">Selecionar Áudio para Demonstração</h4>
          <div className="flex gap-3">
            <Select
              value={selectedAudioId}
              onValueChange={setSelectedAudioId}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Escolha um áudio..." />
              </SelectTrigger>
              <SelectContent>
                {availableAudios.map((audio) => (
                  <SelectItem key={audio.id} value={audio.id}>
                    <div className="flex items-center gap-2">
                      <Play className="h-3 w-3" />
                      <span>{audio.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {audio.field_title}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleSaveDemo}
              disabled={!selectedAudioId || saving || selectedAudioId === config?.demo_audio_id}
            >
              {saving ? 'Salvando...' : 'Aplicar'}
            </Button>
          </div>
        </div>

        {/* Informações */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h5 className="font-medium text-blue-900 mb-2">Como funciona a demonstração</h5>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• O áudio selecionado ficará disponível gratuitamente</li>
            <li>• Visitantes podem acessar via botão "Ver Demonstração"</li>
            <li>• Eles poderão ouvir e configurar quantas vezes quiserem</li>
            <li>• É uma ótima forma de mostrar o valor do Drive Mental</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};