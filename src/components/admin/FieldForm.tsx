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
import { Field, FieldInsert, FieldUpdate } from "@/services/supabase/fieldService";

interface FieldFormProps {
  field?: Field | null;
  onSave: (field: FieldInsert | (FieldUpdate & { id: string })) => void;
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
    icon_name: "",
    description: "",
  });

  useEffect(() => {
    if (field) {
      setFormData({
        title: field.title,
        icon_name: field.icon_name,
        description: field.description,
      });
    }
  }, [field]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("FieldForm: handleSubmit chamado", { formData, field });
    
    if (!formData.title.trim() || !formData.icon_name || !formData.description.trim()) {
      console.log("FieldForm: Validação falhou", formData);
      return;
    }

    console.log("FieldForm: Validação passou, chamando onSave");
    if (field) {
      console.log("FieldForm: Editando campo existente", { ...formData, id: field.id });
      onSave({ ...formData, id: field.id });
    } else {
      console.log("FieldForm: Criando novo campo", formData);
      onSave(formData);
    }
  };

  const handleChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
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
            <Select value={formData.icon_name} onValueChange={(value) => handleChange('icon_name', value)}>
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