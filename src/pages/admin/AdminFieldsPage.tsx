/**
 * AdminFieldsPage - Responsável pela administração de campos
 * Responsabilidade: Interface de gerenciamento de campos
 * Princípio SRP: Apenas coordenação de UI de campos
 * Princípio SSOT: Usa ContentService como fonte única
 */

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { FieldForm } from "@/components/admin/FieldForm";
import { FieldList } from "@/components/admin/FieldList";
import { RefreshButton } from "@/components/RefreshButton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ContentService, EditableField } from "@/services/contentService";
import { SyncService } from "@/services/syncService";
import { useSync } from "@/hooks/useSync";
import { useToast } from "@/hooks/use-toast";

export default function AdminFieldsPage() {
  const [fields, setFields] = useState<EditableField[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const { toast } = useToast();

  // Carregar campos iniciais
  const loadFields = () => {
    try {
      const fieldsData = ContentService.getEditableFields();
      setFields(fieldsData);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar campos",
        variant: "destructive",
      });
    }
  };

  // Sincronização em tempo real
  useSync((eventType) => {
    if (eventType === 'fields_updated') {
      loadFields();
    }
  }, ['fields_updated']);

  useEffect(() => {
    loadFields();
  }, []);

  const handleSaveField = (fieldData: Omit<EditableField, 'id' | 'audioCount' | 'audios'>) => {
    try {
      const field: EditableField = {
        ...fieldData,
        id: editingField?.id || ContentService.generateId(),
        audioCount: editingField?.audioCount || 0,
        audios: editingField?.audios || []
      };

      ContentService.saveField(field);
      SyncService.notifyFieldsUpdated();
      
      setIsFormOpen(false);
      setEditingField(null);
      
      toast({
        title: "Sucesso",
        description: editingField ? "Campo atualizado com sucesso" : "Campo criado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar campo",
        variant: "destructive",
      });
    }
  };

  const handleEditField = (field: EditableField) => {
    setEditingField(field);
    setIsFormOpen(true);
  };

  const handleDeleteField = (fieldId: string) => {
    try {
      ContentService.deleteField(fieldId);
      SyncService.notifyFieldsUpdated();
      SyncService.notifyAudiosUpdated();
      
      toast({
        title: "Sucesso",
        description: "Campo excluído com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir campo",
        variant: "destructive",
      });
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingField(null);
  };


  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Gerenciar Campos</h1>
            <p className="text-muted-foreground">
              Administre os campos de desenvolvimento pessoal
            </p>
          </div>
          <div className="flex gap-2">
            <RefreshButton />
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Campo
            </Button>
          </div>
        </div>

        <FieldList
          fields={fields}
          onEdit={handleEditField}
          onDelete={handleDeleteField}
        />

        {isFormOpen && (
          <FieldForm
            field={editingField}
            onSave={handleSaveField}
            onClose={handleCloseForm}
          />
        )}
      </div>
    </AdminLayout>
  );
}