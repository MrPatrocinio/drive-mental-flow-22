/**
 * VideoManager - Componente para gerenciar vídeos da landing page
 * Responsabilidade: UI para CRUD de vídeos
 * Princípio SRP: Apenas interface para gerenciamento de vídeos
 * Princípio DRY: Reutiliza componentes de UI existentes
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { VideoService, Video, VideoSection } from '@/services/supabase/videoService';
import { Plus, Edit2, Trash2, Play, Eye, EyeOff } from 'lucide-react';

export const VideoManager: React.FC = () => {
  const [videos, setVideos] = useState<VideoSection>({ active_video_id: null, videos: [] });
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    thumbnail: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const videoData = await VideoService.getVideos();
      setVideos(videoData);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar vídeos',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      url: '',
      description: '',
      thumbnail: ''
    });
    setEditingVideo(null);
  };

  const handleAddVideo = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleEditVideo = (video: Video) => {
    setFormData({
      title: video.title,
      url: video.url,
      description: video.description || '',
      thumbnail: video.thumbnail || ''
    });
    setEditingVideo(video);
    setIsAddDialogOpen(true);
  };

  const handleSaveVideo = async () => {
    try {
      if (!formData.title.trim() || !formData.url.trim()) {
        toast({
          title: 'Erro',
          description: 'Título e URL são obrigatórios',
          variant: 'destructive'
        });
        return;
      }

      const convertedUrl = VideoService.convertYouTubeUrl(formData.url);

      if (editingVideo) {
        await VideoService.updateVideo(editingVideo.id, {
          title: formData.title,
          url: convertedUrl,
          description: formData.description || undefined,
          thumbnail: formData.thumbnail || undefined
        });
        toast({
          title: 'Sucesso',
          description: 'Vídeo atualizado com sucesso'
        });
      } else {
        await VideoService.addVideo({
          title: formData.title,
          url: convertedUrl,
          description: formData.description || undefined,
          thumbnail: formData.thumbnail || undefined
        });
        toast({
          title: 'Sucesso',
          description: 'Vídeo adicionado com sucesso'
        });
      }

      setIsAddDialogOpen(false);
      resetForm();
      loadVideos();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao salvar vídeo',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Tem certeza que deseja remover este vídeo?')) return;

    try {
      await VideoService.deleteVideo(videoId);
      toast({
        title: 'Sucesso',
        description: 'Vídeo removido com sucesso'
      });
      loadVideos();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao remover vídeo',
        variant: 'destructive'
      });
    }
  };

  const handleToggleActive = async (videoId: string) => {
    try {
      const newActiveId = videos.active_video_id === videoId ? null : videoId;
      await VideoService.setActiveVideo(newActiveId);
      
      toast({
        title: 'Sucesso',
        description: newActiveId 
          ? 'Vídeo ativado na landing page' 
          : 'Vídeo desativado da landing page'
      });
      loadVideos();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao alterar status do vídeo',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Vídeos</h2>
          <p className="text-muted-foreground">
            Controle os vídeos exibidos na página inicial
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddVideo}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Vídeo
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingVideo ? 'Editar Vídeo' : 'Novo Vídeo'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Título do vídeo"
                />
              </div>
              
              <div>
                <Label htmlFor="url">URL do YouTube *</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://youtube.com/watch?v=..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Aceita URLs do YouTube, será convertida automaticamente para embed
                </p>
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição do vídeo"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="thumbnail">URL da Thumbnail</Label>
                <Input
                  id="thumbnail"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData(prev => ({ ...prev, thumbnail: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveVideo}>
                {editingVideo ? 'Atualizar' : 'Adicionar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Vídeos */}
      <div className="grid gap-4">
        {videos.videos.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                Nenhum vídeo cadastrado ainda.
              </p>
              <Button className="mt-4" onClick={handleAddVideo}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Vídeo
              </Button>
            </CardContent>
          </Card>
        ) : (
          videos.videos.map((video) => (
            <Card key={video.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg truncate">
                        {video.title}
                      </CardTitle>
                      {videos.active_video_id === video.id && (
                        <Badge variant="default" className="bg-green-500">
                          <Play className="h-3 w-3 mr-1" />
                          Ativo
                        </Badge>
                      )}
                    </div>
                    {video.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {video.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(video.id)}
                      className={videos.active_video_id === video.id ? 'text-green-600' : ''}
                    >
                      {videos.active_video_id === video.id ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditVideo(video)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteVideo(video.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <iframe
                    src={video.url}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={video.title}
                  />
                </div>
                
                <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                  <span>Criado em: {new Date(video.created_at).toLocaleDateString('pt-BR')}</span>
                  <a 
                    href={video.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Ver no YouTube
                  </a>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};