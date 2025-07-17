import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PlaylistFormData {
  name: string;
  description: string;
}

interface PlaylistFormProps {
  initialData?: PlaylistFormData;
  onSubmit: (data: PlaylistFormData) => Promise<void> | void;
  onCancel: () => void;
  submitLabel: string;
  isLoading?: boolean;
}

export function PlaylistForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  submitLabel, 
  isLoading = false 
}: PlaylistFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description);
    }
  }, [initialData]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, insira um nome para sua playlist.",
        variant: "destructive"
      });
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim()
      });
    } catch (error) {
      // O erro será tratado pelo componente pai
    }
  };

  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="playlist-name">Nome da Playlist *</Label>
        <Input
          id="playlist-name"
          placeholder="Ex: Meus Favoritos"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
          disabled={isLoading}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="playlist-description">Descrição (opcional)</Label>
        <Textarea
          id="playlist-description"
          placeholder="Descreva sua playlist..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={200}
          rows={3}
          disabled={isLoading}
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? "Processando..." : submitLabel}
        </Button>
      </div>
    </div>
  );
}