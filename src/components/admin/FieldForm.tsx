/**
 * FieldForm - Responsável pelo formulário de campos
 * Responsabilidade: Interface de criação/edição de campos
 * Princípio SRP: Apenas formulário de campo
 * Princípio DRY: Componente reutilizável para criar/editar
 */

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EditableField } from "@/services/contentService";

interface FieldFormProps {
  field?: EditableField | null;
  onSave: (field: Omit<EditableField, 'id' | 'audioCount' | 'audios'>) => void;
  onClose: () => void;
}

const iconOptions = [
  { value: "Heart", label: "Coração" },
  { value: "Target", label: "Alvo" },
  { value: "DollarSign", label: "Dinheiro" },
  { value: "Activity", label: "Atividade" },
  { value: "Sparkles", label: "Estrelas" },
  { value: "Brain", label: "Cérebro" },
  { value: "Users", label: "Usuários" },
  { value: "Award", label: "Prêmio" },
  { value: "Zap", label: "Raio" },
  { value: "Star", label: "Estrela" },
];

export function FieldForm({ field, onSave, onClose }: FieldFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    iconName: "",
    description: "",
  });

  useEffect(() => {
    if (field) {
      setFormData({
        title: field.title,
        iconName: field.iconName,
        description: field.description,
      });
    }
  }, [field]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.iconName || !formData.description.trim()) {
      return;
    }

    onSave(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {field ? "Editar Campo" : "Novo Campo"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Ex: Desenvolvimento Emocional"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">Ícone</Label>
            <Select value={formData.iconName} onValueChange={(value) => handleChange('iconName', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um ícone" />
              </SelectTrigger>
              <SelectContent>
                {iconOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descreva o objetivo deste campo de desenvolvimento"
              rows={3}
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {field ? "Atualizar" : "Criar"} Campo
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}