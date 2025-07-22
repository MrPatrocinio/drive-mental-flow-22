/**
 * Audio Upload Form - Formulário de upload de áudio com arquivo
 * Responsabilidade: Interface para upload e criação de áudios
 * Princípio SRP: Apenas formulário de upload de áudio
 * Princípio DRY: Componente reutilizável
 */

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Upload, X, Music } from "lucide-react";
import { AudioWithFile } from "@/services/supabase/audioService";
import { Field } from "@/services/supabase/fieldService";

interface AudioUploadFormProps {
  fields: Field[];
  onSubmit: (audioData: AudioWithFile) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  errors?: string[];
}

export const AudioUploadForm = ({ 
  fields,
  onSubmit, 
  onCancel, 
  isLoading = false,
  errors = []
}: AudioUploadFormProps) => {
  const [formData, setFormData] = useState<Omit<AudioWithFile, 'file'>>({
    title: "",
    duration: "",
    field_id: ""
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      return;
    }

    onSubmit({
      ...formData,
      file: selectedFile
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Verificar se é arquivo de áudio
      if (!file.type.startsWith('audio/')) {
        alert('Por favor, selecione um arquivo de áudio válido.');
        return;
      }

      // Verificar tamanho (50MB max)
      if (file.size > 50 * 1024 * 1024) {
        alert('Arquivo muito grande. Tamanho máximo: 50MB');
        return;
      }

      setSelectedFile(file);
      
      // Auto-preencher título se vazio
      if (!formData.title) {
        const fileName = file.name.replace(/\.[^/.]+$/, "");
        setFormData(prev => ({ ...prev, title: fileName }));
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="w-5 h-5" />
          Upload de Áudio
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.length > 0 && (
            <div className="p-3 border border-destructive/20 bg-destructive/10 rounded-md">
              <ul className="text-sm text-destructive space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Upload de Arquivo */}
          <div className="space-y-2">
            <Label>Arquivo de Áudio</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6">
              {!selectedFile ? (
                <div className="text-center">
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Clique para selecionar um arquivo de áudio
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Formatos suportados: MP3, WAV, OGG, AAC (máx. 50MB)
                  </p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={triggerFileSelect}
                    disabled={isLoading}
                  >
                    Selecionar Arquivo
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <div className="flex items-center gap-3">
                    <Music className="w-8 h-8 text-primary" />
                    <div>
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    disabled={isLoading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isLoading}
            />
          </div>

          {/* Informações do Áudio */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Digite o título do áudio"
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duração (MM:SS) *</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => handleChange("duration", e.target.value)}
                placeholder="Ex: 15:30"
                pattern="[0-9]+:[0-9]{2}"
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="field_id">Campo *</Label>
              <Select 
                value={formData.field_id} 
                onValueChange={(value) => handleChange("field_id", value)}
                disabled={isLoading}
                required
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
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={isLoading || !selectedFile || !formData.title || !formData.duration || !formData.field_id}
              className="flex-1"
            >
              {isLoading ? "Fazendo Upload..." : "Fazer Upload"}
            </Button>
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};