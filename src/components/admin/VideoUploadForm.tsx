
/**
 * VideoUploadForm - Componente para upload de vídeos locais
 * Responsabilidade: UI para upload de vídeos do computador
 * Princípio SRP: Apenas interface de upload de vídeo
 * Princípio DRY: Componente reutilizável para upload
 */

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useVideoUpload } from '@/hooks/useVideoUpload';
import { VideoUploadService } from '@/services/supabase/videoUploadService';
import { Upload, Video, X, CheckCircle, AlertCircle } from 'lucide-react';

interface VideoUploadFormProps {
  onUploadComplete: (videoUrl: string) => void;
  onCancel: () => void;
}

export const VideoUploadForm: React.FC<VideoUploadFormProps> = ({
  onUploadComplete,
  onCancel
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { isUploading, progress, error, uploadVideo, reset } = useVideoUpload();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar arquivo
    const validation = VideoUploadService.validateVideoFile(file);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    setSelectedFile(file);
    
    // Criar preview URL
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
    
    reset(); // Resetar estado do upload
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const uploadedUrl = await uploadVideo(selectedFile);
    if (uploadedUrl) {
      onUploadComplete(uploadedUrl);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    reset();
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Upload de Vídeo Local
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Área de Upload */}
        {!selectedFile ? (
          <div 
            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={triggerFileSelect}
          >
            <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              Clique para selecionar um vídeo do seu computador
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Formatos: MP4, MPEG, MOV, AVI, WebM (máx. 50MB)
            </p>
            <Button variant="outline" type="button">
              Selecionar Vídeo
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Preview do Vídeo */}
            <div className="relative">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                {previewUrl && (
                  <video
                    src={previewUrl}
                    className="w-full h-full object-cover"
                    controls
                  />
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemoveFile}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Informações do Arquivo */}
            <div className="bg-muted p-3 rounded-md">
              <div className="flex items-center gap-3">
                <Video className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                {!isUploading && !error && (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
                {error && (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                )}
              </div>
            </div>

            {/* Barra de Progresso */}
            {isUploading && progress && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Fazendo upload...</span>
                  <span>{progress.percentage.toFixed(1)}%</span>
                </div>
                <Progress value={progress.percentage} className="w-full" />
              </div>
            )}

            {/* Erro */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </div>
        )}

        {/* Input de Arquivo (Hidden) */}
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/mpeg,video/quicktime,video/x-msvideo,video/webm"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        {/* Botões */}
        <div className="flex gap-2 pt-4">
          <Button 
            onClick={handleUpload} 
            disabled={!selectedFile || isUploading}
            className="flex-1"
          >
            {isUploading ? 'Fazendo Upload...' : 'Confirmar Upload'}
          </Button>
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={isUploading}
          >
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
