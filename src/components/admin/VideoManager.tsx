
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { VideoService, Video, VideoSection, VideoControls } from '@/services/supabase/videoService';
import { VideoControlsPanel } from './VideoControlsPanel';
import { VideoUploadForm } from './VideoUploadForm';
import { Plus, Edit2, Trash2, Play, Eye, EyeOff, Link, Upload } from 'lucide-react';

export const VideoManager: React.FC = () => {
  const [videos, setVideos] = useState<VideoSection>({ active_video_id: null, videos: [] });
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [videoInputMode, setVideoInputMode] = useState<'url' | 'upload'>('url');
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    thumbnail: ''
  });
  const [videoControls, setVideoControls] = useState<VideoControls>(VideoService.getDefaultVideoControls());
  const { toast } = useToast();

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const videoData = await VideoService.getVideos();
      
      // Auto-ativar o primeiro vídeo se nenhum estiver ativo e existirem vídeos
      if (!videoData.active_video_id && videoData.videos.length > 0) {
        await VideoService.setActiveVideo(videoData.videos[0].id);
        const updatedData = await VideoService.getVideos();
        setVideos(updatedData);
        toast({
          title: 'Vídeo Ativado',
          description: 'O primeiro vídeo foi automaticamente ativado na landing page',
          variant: 'default'
        });
      } else {
        setVideos(videoData);
      }
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
    setVideoControls(VideoService.getDefaultVideoControls());
    setEditingVideo(null);
    setVideoInputMode('url');
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
    setVideoControls(video.video_controls || VideoService.getDefaultVideoControls());
    setVideoInputMode(video.type || 'url');
    setEditingVideo(video);
    setIsAddDialogOpen(true);
  };

  const handleUploadComplete = (uploadedUrl: string) => {
    setFormData(prev => ({ ...prev, url: uploadedUrl }));
    setVideoInputMode('upload');
  };

  const handleSaveVideo = async () => {
    try {
      if (!formData.title.trim() || !formData.url.trim()) {
        toast({
          title: 'Erro',
          description: 'Título e vídeo são obrigatórios',
          variant: 'destructive'
        });
        return;
      }

      // Processar URL baseado no modo
      let processedUrl = formData.url;
      let videoType: 'youtube' | 'upload' = 'url';
      
      if (videoInputMode === 'url') {
        processedUrl = VideoService.convertYouTubeUrl(formData.url);
        videoType = VideoService.determineVideoType(processedUrl);
      } else {
        videoType = 'upload';
      }

      if (editingVideo) {
        await VideoService.updateVideo(editingVideo.id, {
          title: formData.title,
          url: processedUrl,
          type: videoType,
          description: formData.description || undefined,
          thumbnail: formData.thumbnail || undefined,
          video_controls: videoControls
        });
        toast({
          title: 'Sucesso',
          description: 'Vídeo atualizado com sucesso'
        });
      } else {
        await VideoService.addVideo({
          title: formData.title,
          url: processedUrl,
          type: videoType,
          description: formData.description || undefined,
          thumbnail: formData.thumbnail || undefined,
          video_controls: videoControls
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
            Controle os vídeos exibidos na página inicial (YouTube ou uploads locais)
          </p>
          {videos.active_video_id && (
            <div className="mt-2">
              <Badge variant="outline" className="text-green-600 border-green-600">
                <Play className="h-3 w-3 mr-1" />
                Vídeo ativo na landing page
              </Badge>
            </div>
          )}
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddVideo}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Vídeo
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingVideo ? 'Editar Vídeo' : 'Novo Vídeo'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Seleção do Tipo de Vídeo */}
              <div className="lg:col-span-2">
                <Tabs value={videoInputMode} onValueChange={(value) => setVideoInputMode(value as 'url' | 'upload')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="url" className="flex items-center gap-2">
                      <Link className="h-4 w-4" />
                      URL do YouTube
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Upload Local
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="url" className="space-y-4 mt-4">
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
                  </TabsContent>
                  
                  <TabsContent value="upload" className="mt-4">
                    {!formData.url ? (
                      <VideoUploadForm
                        onUploadComplete={handleUploadComplete}
                        onCancel={() => setVideoInputMode('url')}
                      />
                    ) : (
                      <div className="space-y-4">
                        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                          <p className="text-sm text-green-800">
                            ✅ Vídeo enviado com sucesso! Agora adicione as informações abaixo.
                          </p>
                        </div>
                        
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
                          <Label htmlFor="description">Descrição</Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Descrição do vídeo"
                            rows={3}
                          />
                        </div>
                        
                        <Button
                          variant="outline"
                          onClick={() => setFormData(prev => ({ ...prev, url: '' }))}
                        >
                          Escolher Outro Vídeo
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>

              {/* Painel de Controles */}
              {(videoInputMode === 'url' || formData.url) && (
                <div className="lg:col-span-2">
                  <VideoControlsPanel
                    controls={videoControls}
                    onChange={setVideoControls}
                  />
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveVideo}
                disabled={!formData.title || !formData.url}
              >
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
              <div className="mb-4">
                <Play className="h-16 w-16 mx-auto text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhum vídeo cadastrado</h3>
              <p className="text-muted-foreground mb-4">
                Adicione vídeos do YouTube para exibir na página inicial do seu site.
              </p>
              <Button className="mt-4" onClick={handleAddVideo}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Vídeo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {!videos.active_video_id && (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                      <Eye className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-amber-800">Nenhum vídeo ativo</p>
                      <p className="text-sm text-amber-600">Clique em "Ativar" em um dos vídeos abaixo para exibi-lo na landing page.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {videos.videos.map((video) => (
            <Card key={video.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg truncate">
                        {video.title}
                      </CardTitle>
                      <Badge variant={video.type === 'upload' ? 'default' : 'secondary'}>
                        {video.type === 'upload' ? 'Local' : 'YouTube'}
                      </Badge>
                      {videos.active_video_id === video.id && (
                        <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                          <Play className="h-3 w-3 mr-1" />
                          Na Landing Page
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
                      variant={videos.active_video_id === video.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleToggleActive(video.id)}
                      className={videos.active_video_id === video.id ? 'bg-green-600 hover:bg-green-700 text-white' : 'hover:bg-green-50 hover:text-green-600 hover:border-green-600'}
                    >
                      {videos.active_video_id === video.id ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-1" />
                          Desativar
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-1" />
                          Ativar
                        </>
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
                  {video.type === 'upload' ? (
                    <video
                      src={video.url}
                      className="w-full h-full object-cover"
                      controls
                      title={video.title}
                    />
                  ) : (
                    <iframe
                      src={video.url}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={video.title}
                    />
                  )}
                </div>
                
                <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                  <span>Criado em: {new Date(video.created_at).toLocaleDateString('pt-BR')}</span>
                  {video.type === 'youtube' && (
                    <a 
                      href={video.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Ver no YouTube
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
