import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { VideoService, Video, VideoControls } from '@/services/supabase/videoService';
import { VideoUploadService } from '@/services/supabase/videoUploadService';
import { useToast } from "@/components/ui/use-toast";
import { SyncStatusIndicator } from '@/components/SyncStatusIndicator';

interface VideoFormState {
  title: string;
  url: string;
  description?: string;
  type: 'youtube' | 'upload' | 'atomicat';
  video_controls?: VideoControls;
}

export const VideoManager = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("list");

  // YouTube Form State
  const [youtubeTitle, setYoutubeTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeDescription, setYoutubeDescription] = useState('');

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDescription, setUploadDescription] = useState('');

  // Atomicat Form State
  const [atomicatTitle, setAtomicatTitle] = useState('');
  const [atomicatInput, setAtomicatInput] = useState('');
  const [atomicatDescription, setAtomicatDescription] = useState('');

  // Video Controls State
  const [videoControls, setVideoControls] = useState<VideoControls>({
    allowPause: true,
    allowVolumeControl: true,
    allowSeek: true,
    allowFullscreen: true,
    allowKeyboardControls: true,
    showControls: true,
    autoplay: false,
    muted: false
  });

  const { toast } = useToast();

  const loadVideos = useCallback(async () => {
    try {
      const videoSection = await VideoService.getVideos();
      setVideos(videoSection.videos);
      setActiveVideoId(videoSection.active_video_id);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar vídeos",
        description: error.message,
      });
    }
  }, [toast]);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  const handleAddYouTubeVideo = async () => {
    setIsAdding(true);
    try {
      await VideoService.addVideo({
        title: youtubeTitle,
        url: youtubeUrl,
        description: youtubeDescription,
        type: 'youtube',
        video_controls: videoControls
      });
      setYoutubeTitle('');
      setYoutubeUrl('');
      setYoutubeDescription('');
      setVideoControls({
        allowPause: true,
        allowVolumeControl: true,
        allowSeek: true,
        allowFullscreen: true,
        allowKeyboardControls: true,
        showControls: true,
        autoplay: false,
        muted: false
      });
      await loadVideos();
      toast({
        title: "Vídeo do YouTube adicionado!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao adicionar vídeo do YouTube",
        description: error.message,
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddAtomicatVideo = async () => {
    setIsAdding(true);
    try {
      await VideoService.addVideo({
        title: atomicatTitle,
        url: atomicatInput,
        description: atomicatDescription,
        type: 'atomicat',
        video_controls: videoControls
      });
      setAtomicatTitle('');
      setAtomicatInput('');
      setAtomicatDescription('');
      setVideoControls({
        allowPause: true,
        allowVolumeControl: true,
        allowSeek: true,
        allowFullscreen: true,
        allowKeyboardControls: true,
        showControls: true,
        autoplay: false,
        muted: false
      });
      await loadVideos();
      toast({
        title: "Vídeo da Atomicat adicionado!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao adicionar vídeo da Atomicat",
        description: error.message,
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, selecione um arquivo para upload.",
      });
      return;
    }

    setIsAdding(true);
    try {
      const uploadResult = await VideoUploadService.uploadVideo(uploadFile);
      if (uploadResult.success && uploadResult.url) {
        await VideoService.addVideo({
          title: uploadTitle,
          url: uploadResult.url,
          description: uploadDescription,
          type: 'upload',
          video_controls: videoControls
        });

        setUploadTitle('');
        setUploadFile(null);
        setUploadDescription('');
        setVideoControls({
          allowPause: true,
          allowVolumeControl: true,
          allowSeek: true,
          allowFullscreen: true,
          allowKeyboardControls: true,
          showControls: true,
          autoplay: false,
          muted: false
        });
        await loadVideos();
        toast({
          title: "Vídeo enviado com sucesso!",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro no upload",
          description: uploadResult.error || "Falha ao enviar o vídeo.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao adicionar vídeo",
        description: error.message,
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    setIsDeleting(true);
    try {
      await VideoService.deleteVideo(videoId);
      await loadVideos();
      toast({
        title: "Vídeo removido com sucesso!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao remover vídeo",
        description: error.message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSetActiveVideo = async (videoId: string) => {
    try {
      await VideoService.setActiveVideo(videoId);
      await loadVideos();
      toast({
        title: "Vídeo ativo atualizado!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao definir vídeo ativo",
        description: error.message,
      });
    }
  };

  const handleUpdateVideoControls = async (videoId: string, controls: Partial<VideoControls>) => {
    setIsUpdating(true);
    try {
      await VideoService.updateVideo(videoId, { video_controls: { ...videoControls, ...controls } });
      await loadVideos();
      toast({
        title: "Controles de vídeo atualizados!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar controles de vídeo",
        description: error.message,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gerenciar Vídeos</h2>
        <SyncStatusIndicator />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="list">Lista de Vídeos</TabsTrigger>
          <TabsTrigger value="youtube">YouTube</TabsTrigger>
          <TabsTrigger value="upload">Upload Local</TabsTrigger>
          <TabsTrigger value="atomicat">Atomicat</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vídeos Cadastrados</CardTitle>
              <CardDescription>
                Lista de todos os vídeos cadastrados no sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {videos.map((video) => (
                  <div key={video.id} className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{video.title}</h3>
                      <p className="text-sm text-muted-foreground">{video.type} - {video.url}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={activeVideoId === video.id ? "secondary" : "outline"}
                        onClick={() => handleSetActiveVideo(video.id)}
                      >
                        {activeVideoId === video.id ? 'Ativo' : 'Definir como Ativo'}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteVideo(video.id)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? 'Removendo...' : 'Remover'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="youtube" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Vídeo do YouTube</CardTitle>
              <CardDescription>
                Preencha os campos abaixo para adicionar um novo vídeo do YouTube.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="youtube-title">Título do Vídeo</Label>
                <Input
                  id="youtube-title"
                  placeholder="Digite o título do vídeo"
                  value={youtubeTitle}
                  onChange={(e) => setYoutubeTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtube-url">URL do Vídeo</Label>
                <Input
                  id="youtube-url"
                  placeholder="Cole a URL do vídeo do YouTube"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtube-description">Descrição (Opcional)</Label>
                <Textarea
                  id="youtube-description"
                  placeholder="Digite uma descrição para o vídeo"
                  value={youtubeDescription}
                  onChange={(e) => setYoutubeDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <Button
                onClick={handleAddYouTubeVideo}
                disabled={!youtubeTitle.trim() || !youtubeUrl.trim() || isAdding}
                className="w-full"
              >
                {isAdding ? 'Adicionando...' : 'Adicionar Vídeo'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload de Vídeo Local</CardTitle>
              <CardDescription>
                Selecione um arquivo de vídeo do seu computador para enviar.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="upload-title">Título do Vídeo</Label>
                <Input
                  id="upload-title"
                  placeholder="Digite o título do vídeo"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="upload-file">Arquivo de Vídeo</Label>
                <Input
                  type="file"
                  id="upload-file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setUploadFile(e.target.files[0]);
                    }
                  }}
                />
                {uploadFile && (
                  <p className="text-sm text-muted-foreground">
                    Arquivo selecionado: {uploadFile.name}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="upload-description">Descrição (Opcional)</Label>
                <Textarea
                  id="upload-description"
                  placeholder="Digite uma descrição para o vídeo"
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <Button
                onClick={handleUpload}
                disabled={!uploadTitle.trim() || !uploadFile || isAdding}
                className="w-full"
              >
                {isAdding ? 'Enviando...' : 'Enviar Vídeo'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="atomicat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Vídeo da Atomicat</CardTitle>
              <CardDescription>
                Cole a URL do vídeo da Atomicat ou o código embed completo (HTML com iframe ou video-js).
                <br />
                <span className="text-muted-foreground text-sm">
                  💡 Dica: Se você tem um código HTML completo com scripts, cole ele inteiro para melhor compatibilidade.
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="atomicat-input">URL ou Código Embed da Atomicat</Label>
                <Textarea
                  id="atomicat-input"
                  placeholder="Cole aqui a URL ou código HTML completo da Atomicat..."
                  value={atomicatInput}
                  onChange={(e) => setAtomicatInput(e.target.value)}
                  rows={6}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="atomicat-title">Título do Vídeo</Label>
                <Input
                  id="atomicat-title"
                  placeholder="Digite o título do vídeo"
                  value={atomicatTitle}
                  onChange={(e) => setAtomicatTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="atomicat-description">Descrição (Opcional)</Label>
                <Textarea
                  id="atomicat-description"
                  placeholder="Digite uma descrição para o vídeo"
                  value={atomicatDescription}
                  onChange={(e) => setAtomicatDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleAddAtomicatVideo} 
                disabled={!atomicatInput.trim() || !atomicatTitle.trim() || isAdding}
                className="w-full"
              >
                {isAdding ? 'Adicionando...' : 'Adicionar Vídeo da Atomicat'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <VideoControlsPanel
        controls={videoControls}
        onControlsChange={setVideoControls}
      />
    </div>
  );
};

interface VideoControlsPanelProps {
  controls: VideoControls;
  onControlsChange: (controls: VideoControls) => void;
}

const VideoControlsPanel: React.FC<VideoControlsPanelProps> = ({ controls, onControlsChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Controles do Vídeo</CardTitle>
        <CardDescription>
          Ajuste as configurações de controle do vídeo.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="allowPause">Permitir Pausa</Label>
          <Switch
            id="allowPause"
            checked={controls.allowPause}
            onCheckedChange={(checked) => onControlsChange({ ...controls, allowPause: checked })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="allowVolumeControl">Permitir Controle de Volume</Label>
          <Switch
            id="allowVolumeControl"
            checked={controls.allowVolumeControl}
            onCheckedChange={(checked) => onControlsChange({ ...controls, allowVolumeControl: checked })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="allowSeek">Permitir Seek</Label>
          <Switch
            id="allowSeek"
            checked={controls.allowSeek}
            onCheckedChange={(checked) => onControlsChange({ ...controls, allowSeek: checked })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="allowFullscreen">Permitir Tela Cheia</Label>
          <Switch
            id="allowFullscreen"
            checked={controls.allowFullscreen}
            onCheckedChange={(checked) => onControlsChange({ ...controls, allowFullscreen: checked })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="allowKeyboardControls">Permitir Controles do Teclado</Label>
          <Switch
            id="allowKeyboardControls"
            checked={controls.allowKeyboardControls}
            onCheckedChange={(checked) => onControlsChange({ ...controls, allowKeyboardControls: checked })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="showControls">Mostrar Controles</Label>
          <Switch
            id="showControls"
            checked={controls.showControls}
            onCheckedChange={(checked) => onControlsChange({ ...controls, showControls: checked })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="autoplay">Autoplay</Label>
          <Switch
            id="autoplay"
            checked={controls.autoplay}
            onCheckedChange={(checked) => onControlsChange({ ...controls, autoplay: checked })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="muted">Muted</Label>
          <Switch
            id="muted"
            checked={controls.muted}
            onCheckedChange={(checked) => onControlsChange({ ...controls, muted: checked })}
          />
        </div>
      </CardContent>
    </Card>
  );
};
