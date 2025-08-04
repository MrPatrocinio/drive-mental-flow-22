/**
 * Background Music List Component
 * Responsabilidade: Lista e gerenciamento de músicas de fundo
 * Princípio SRP: Apenas UI para listagem de músicas
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Music, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Plus,
  Volume2
} from 'lucide-react';
import { BackgroundMusicService, BackgroundMusic } from '@/services/supabase/backgroundMusicService';
import { BackgroundMusicSettingsService } from '@/services/supabase/backgroundMusicSettingsService';
import { BackgroundMusicForm } from './BackgroundMusicForm';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export const BackgroundMusicList = () => {
  const [musics, setMusics] = useState<BackgroundMusic[]>([]);
  const [volumePercentage, setVolumePercentage] = useState(25);
  const [isLoading, setIsLoading] = useState(true);
  const [editingMusic, setEditingMusic] = useState<BackgroundMusic | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<Map<string, HTMLAudioElement>>(new Map());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [musicList, settings] = await Promise.all([
        BackgroundMusicService.getAll(),
        BackgroundMusicSettingsService.getSettings()
      ]);
      
      setMusics(musicList);
      if (settings) {
        setVolumePercentage(settings.volume_percentage);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar músicas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (data: Omit<BackgroundMusic, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await BackgroundMusicService.create(data);
      toast.success('Música criada com sucesso');
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error('Erro ao criar música:', error);
      toast.error('Erro ao criar música');
    }
  };

  const handleUpdate = async (data: Omit<BackgroundMusic, 'id' | 'created_at' | 'updated_at'>) => {
    if (!editingMusic) return;
    
    try {
      await BackgroundMusicService.update(editingMusic.id, data);
      toast.success('Música atualizada com sucesso');
      setEditingMusic(null);
      loadData();
    } catch (error) {
      console.error('Erro ao atualizar música:', error);
      toast.error('Erro ao atualizar música');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta música?')) return;

    try {
      await BackgroundMusicService.delete(id);
      toast.success('Música excluída com sucesso');
      loadData();
    } catch (error) {
      console.error('Erro ao excluir música:', error);
      toast.error('Erro ao excluir música');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await BackgroundMusicService.toggleActive(id, isActive);
      toast.success(`Música ${isActive ? 'ativada' : 'desativada'}`);
      loadData();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status');
    }
  };

  const handleVolumeChange = async (value: number[]) => {
    const newVolume = value[0];
    setVolumePercentage(newVolume);
    
    try {
      await BackgroundMusicSettingsService.updateVolumePercentage(newVolume);
      toast.success('Volume atualizado');
    } catch (error) {
      console.error('Erro ao atualizar volume:', error);
      toast.error('Erro ao atualizar volume');
    }
  };

  const handlePlayPreview = (music: BackgroundMusic) => {
    // Para todas as outras músicas
    audioElements.forEach((audio, id) => {
      if (id !== music.id) {
        audio.pause();
      }
    });

    let audio = audioElements.get(music.id);
    
    if (!audio) {
      audio = new Audio(music.file_url);
      audio.volume = volumePercentage / 100;
      audio.addEventListener('ended', () => setPlayingId(null));
      audio.addEventListener('error', () => {
        toast.error('Erro ao reproduzir música');
        setPlayingId(null);
      });
      
      setAudioElements(prev => new Map(prev.set(music.id, audio!)));
    }

    if (playingId === music.id) {
      audio.pause();
      setPlayingId(null);
    } else {
      audio.play();
      setPlayingId(music.id);
    }
  };

  if (showForm) {
    return (
      <BackgroundMusicForm
        onSubmit={handleCreate}
        onCancel={() => setShowForm(false)}
      />
    );
  }

  if (editingMusic) {
    return (
      <BackgroundMusicForm
        music={editingMusic}
        onSubmit={handleUpdate}
        onCancel={() => setEditingMusic(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Música de Fundo</h2>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Música
        </Button>
      </div>

      {/* Configurações Globais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Configurações Globais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Volume da Música de Fundo ({volumePercentage}%)</Label>
              <Slider
                value={[volumePercentage]}
                min={2}
                max={30}
                step={1}
                onValueChange={handleVolumeChange}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>2%</span>
                <span>4%</span>
                <span>6%</span>
                <span>10%</span>
                <span>15%</span>
                <span>20%</span>
                <span>30%</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Este percentual será aplicado sobre o volume do usuário
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Músicas */}
      <Card>
        <CardHeader>
          <CardTitle>Músicas Cadastradas ({musics.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground">Carregando...</p>
          ) : musics.length === 0 ? (
            <p className="text-center text-muted-foreground">
              Nenhuma música cadastrada
            </p>
          ) : (
            <div className="space-y-4">
              {musics.map((music) => (
                <div
                  key={music.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Music className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-medium">{music.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {music.file_url}
                        </p>
                      </div>
                    </div>
                    
                    {music.tags.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {music.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Preview */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePlayPreview(music)}
                    >
                      {playingId === music.id ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Ativa</span>
                      <Switch
                        checked={music.is_active}
                        onCheckedChange={(checked) => handleToggleActive(music.id, checked)}
                      />
                    </div>

                    {/* Ações */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingMusic(music)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(music.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};