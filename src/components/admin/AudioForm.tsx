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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Audio, AudioUpdate } from "@/services/supabase/audioService";
import { Field } from "@/services/supabase/fieldService";

interface AudioFormProps {
  audio?: Audio;
  fields: Field[];
  onSubmit: (audioData: AudioUpdate & { id?: string }) => void;
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
  const [formData, setFormData] = useState<AudioUpdate & { id?: string }>({
    title: audio?.title || "",
    duration: audio?.duration || "",
    url: audio?.url || "",
    field_id: audio?.field_id || "",
    id: audio?.id
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
            <Label htmlFor="url">URL do Áudio</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => handleChange("url", e.target.value)}
              placeholder="https://exemplo.com/audio.mp3"
              disabled={isLoading}
            />
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