/**
 * Background Music Form Component
 * Responsabilidade: Formulário para upload/edição de músicas de fundo
 * Princípio SRP: Apenas UI para formulário de música de fundo
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, Upload, Music } from 'lucide-react';
import { BackgroundMusic } from '@/services/supabase/backgroundMusicService';

interface BackgroundMusicFormProps {
  music?: BackgroundMusic;
  onSubmit: (data: Omit<BackgroundMusic, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const BackgroundMusicForm = ({ 
  music, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: BackgroundMusicFormProps) => {
  const [formData, setFormData] = useState({
    title: music?.title || '',
    file_url: music?.file_url || '',
    is_active: music?.is_active ?? true,
    tags: music?.tags || []
  });
  const [newTag, setNewTag] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.file_url) return;

    await onSubmit(formData);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          {music ? 'Editar Música' : 'Nova Música de Fundo'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Nome da música"
              required
            />
          </div>

          {/* URL do Arquivo */}
          <div className="space-y-2">
            <Label htmlFor="file_url">URL do Arquivo</Label>
            <Input
              id="file_url"
              value={formData.file_url}
              onChange={(e) => setFormData(prev => ({ ...prev, file_url: e.target.value }))}
              placeholder="https://exemplo.com/musica.mp3"
              required
            />
            <p className="text-xs text-muted-foreground">
              Formatos suportados: MP3, WAV, OGG
            </p>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between">
            <Label htmlFor="is_active">Música Ativa</Label>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Adicionar tag"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTag}
                disabled={!newTag.trim()}
              >
                Adicionar
              </Button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Ações */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.title || !formData.file_url}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>Salvando...</>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  {music ? 'Atualizar' : 'Criar'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};