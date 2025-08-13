
/**
 * Audio Form Component - Responsável pela UI do formulário de áudio
 * Responsabilidade: Apenas renderizar formulário e emitir eventos
 * Princípio SRP: Apenas UI do formulário
 * Princípio DRY: Reutilizável para criar/editar
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Audio, AudioUpdate, AudioWithFile } from "@/services/supabase/audioService";
import { Field } from "@/services/supabase/fieldService";
import { Upload, X, Music, Crown, Users } from "lucide-react";

interface AudioFormProps {
  audio?: Audio;
  fields: Field[];
  onSubmit: (audioData: AudioWithFile & { id?: string }) => void;
  onCancel: () => void;
  isLoading?: boolean;
  errors?: string[];
}

export const AudioForm = ({ 
  audio, 
  fields,
  onSubmit, 
  onCancel, 
  isLoading = false,
  errors = []
}: AudioFormProps) => {
  const [formData, setFormData] = useState({
    title: audio?.title || "",
    duration: audio?.duration || "",
    field_id: audio?.field_id || "",
    is_premium: audio?.is_premium || false,
    id: audio?.id
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      file: selectedFile || undefined
    });
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/aac'];
      if (!validTypes.includes(file.type)) {
        alert('Por favor, selecione um arquivo de áudio válido (MP3, WAV, OGG, MP4, AAC)');
        return;
      }
      
      // Validar tamanho (50MB max)
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('O arquivo deve ter no máximo 50MB');
        return;
      }

      setSelectedFile(file);
      
      // Auto-preencher título se estiver vazio
      if (!formData.title) {
        const fileName = file.name.replace(/\.[^/.]+$/, "");
        setFormData(prev => ({ ...prev, title: fileName }));
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>
          {audio ? "Editar Áudio" : "Novo Áudio"}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.length > 0 && (
            <div className="p-3 border border-destructive/20 bg-destructive/10 rounded-md">
              <ul className="text-sm text-destructive space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Digite o título do áudio"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duração (MM:SS)</Label>
            <Input
              id="duration"
              value={formData.duration}
              onChange={(e) => handleChange("duration", e.target.value)}
              placeholder="Ex: 15:30"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label>Arquivo de Áudio</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
              {!selectedFile ? (
                <div>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="audio-upload"
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="audio-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <div className="text-sm text-muted-foreground">
                      <span className="text-primary hover:text-primary/80">
                        Clique para selecionar
                      </span>
                      {" "}um arquivo de áudio
                    </div>
                    <div className="text-xs text-muted-foreground">
                      MP3, WAV, OGG, MP4, AAC - Máximo 50MB
                    </div>
                  </label>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <div className="flex items-center gap-2">
                    <Music className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{selectedFile.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            {audio?.url && !selectedFile && (
              <div className="text-xs text-muted-foreground">
                Arquivo atual: {audio.url.split('/').pop()}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="field_id">Campo</Label>
            <Select 
              value={formData.field_id} 
              onValueChange={(value) => handleChange("field_id", value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um campo" />
              </SelectTrigger>
              <SelectContent>
                {fields.map((field) => (
                  <SelectItem key={field.id} value={field.id}>
                    {field.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Tipo de Acesso</Label>
            <div className="flex items-center space-x-4 p-4 border rounded-lg">
              <div className="flex items-center space-x-2 flex-1">
                <div className="flex items-center gap-2">
                  {formData.is_premium ? (
                    <Crown className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <Users className="h-4 w-4 text-green-500" />
                  )}
                  <span className="text-sm font-medium">
                    {formData.is_premium ? "Áudio Premium" : "Áudio Gratuito"}
                  </span>
                </div>
              </div>
              <Switch
                checked={formData.is_premium}
                onCheckedChange={(checked) => handleChange("is_premium", checked)}
                disabled={isLoading}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {formData.is_premium 
                ? "Apenas usuários com assinatura ativa poderão acessar este áudio"
                : "Todos os usuários poderão acessar este áudio, incluindo visitantes na demonstração"
              }
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? "Salvando..." : audio ? "Atualizar" : "Criar"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
