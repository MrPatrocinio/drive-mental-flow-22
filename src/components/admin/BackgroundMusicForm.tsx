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
import { Progress } from '@/components/ui/progress';
import { X, Upload, Music, FileAudio } from 'lucide-react';
import { BackgroundMusic } from '@/services/supabase/backgroundMusicService';
import { BackgroundMusicUploadService, UploadProgress } from '@/services/supabase/backgroundMusicUploadService';
import { toast } from '@/hooks/use-toast';

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = BackgroundMusicUploadService.validateFile(file);
    if (validation) {
      toast({
        title: "Arquivo inválido",
        description: validation,
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    
    // Auto-preencher título se estiver vazio
    if (!formData.title) {
      const filename = file.name.replace(/\.[^/.]+$/, "");
      setFormData(prev => ({ ...prev, title: filename }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar dados básicos
    if (!formData.title) {
      toast({
        title: "Título obrigatório",
        description: "Informe o título da música",
        variant: "destructive"
      });
      return;
    }

    // Se está editando e não selecionou novo arquivo, usar URL existente
    if (music && !selectedFile) {
      await onSubmit(formData);
      return;
    }

    // Se é novo ou selecionou arquivo, fazer upload
    if (!selectedFile) {
      toast({
        title: "Arquivo obrigatório",
        description: "Selecione um arquivo de áudio",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress({ loaded: 0, total: selectedFile.size, percentage: 0 });

      const fileUrl = await BackgroundMusicUploadService.uploadFile(
        selectedFile,
        formData.title,
        setUploadProgress
      );

      await onSubmit({
        ...formData,
        file_url: fileUrl
      });

      toast({
        title: "Sucesso",
        description: "Música de fundo salva com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
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

          {/* Upload de Arquivo */}
          <div className="space-y-2">
            <Label htmlFor="audio_file">Arquivo de Áudio</Label>
            <div className="space-y-3">
              <Input
                id="audio_file"
                type="file"
                accept="audio/mp3,audio/wav,audio/ogg,.mp3,.wav,.ogg"
                onChange={handleFileSelect}
                disabled={isUploading}
              />
              
              {selectedFile && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <FileAudio className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedFile.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
                  </span>
                </div>
              )}

              {music && !selectedFile && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <FileAudio className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Arquivo atual: {BackgroundMusicUploadService.extractFilenameFromUrl(music.file_url)}
                  </span>
                </div>
              )}

              {uploadProgress && (
                <div className="space-y-2">
                  <Progress value={uploadProgress.percentage} className="w-full" />
                  <p className="text-xs text-muted-foreground text-center">
                    Enviando... {uploadProgress.percentage.toFixed(0)}%
                  </p>
                </div>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground">
              Formatos suportados: MP3, WAV, OGG (máximo 50MB)
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
              disabled={
                isLoading || 
                isUploading || 
                !formData.title || 
                (!music && !selectedFile)
              }
              className="flex items-center gap-2"
            >
              {isLoading || isUploading ? (
                <>
                  {isUploading ? 'Enviando...' : 'Salvando...'}
                </>
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