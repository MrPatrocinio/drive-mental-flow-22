import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { IconService, IconOption } from '@/services/iconService';
import { Field } from '@/services/supabase/fieldService';
import { useToast } from '@/hooks/use-toast';

interface FieldEditModalProps {
  field: Field | null;
  open: boolean;
  onClose: () => void;
  onSave: (field: Field) => Promise<void>;
}

/**
 * Modal de edição de campo
 * Seguindo SRP - responsável apenas pela UI de edição
 * Lógica de negócio delegada para o componente pai
 */
export const FieldEditModal: React.FC<FieldEditModalProps> = ({
  field,
  open,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon_name: 'Brain'
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Atualizar formulário quando field mudar (SSOT)
  useEffect(() => {
    if (field) {
      setFormData({
        title: field.title,
        description: field.description || '',
        icon_name: field.icon_name
      });
    }
  }, [field]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!field || !formData.title.trim()) {
      toast({
        title: "Erro",
        description: "Título é obrigatório",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const updatedField: Field = {
        ...field,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        icon_name: formData.icon_name
      };

      await onSave(updatedField);
      toast({
        title: "Sucesso",
        description: "Campo atualizado com sucesso"
      });
      onClose();
    } catch (error) {
      console.error('Erro ao salvar campo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o campo",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const availableIcons = IconService.getAvailableIcons();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Campo</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Digite o título do campo"
              disabled={isLoading}
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Digite uma descrição para o campo"
              rows={3}
              disabled={isLoading}
            />
          </div>

          {/* Seletor de Ícone */}
          <div className="space-y-3">
            <Label>Ícone</Label>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-3">
              {availableIcons.map((iconOption) => {
                const IconComponent = iconOption.component;
                const isSelected = formData.icon_name === iconOption.name;
                
                return (
                  <button
                    key={iconOption.name}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, icon_name: iconOption.name }))}
                    disabled={isLoading}
                    className={`
                      flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all
                      hover:bg-accent hover:border-primary/50
                      ${isSelected 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border'
                      }
                      ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                    title={iconOption.label}
                  >
                    <IconComponent className="w-6 h-6 mb-1" />
                    <span className="text-xs text-center leading-tight">
                      {iconOption.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.title.trim()}
            >
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};