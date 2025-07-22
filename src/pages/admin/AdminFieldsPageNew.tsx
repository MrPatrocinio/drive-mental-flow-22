/**
 * Admin Fields Page - Página de gerenciamento de campos com Supabase
 * Responsabilidade: Interface completa para CRUD de campos
 * Princípio SRP: Apenas gerenciamento de campos
 * Princípio SSOT: Usa Supabase como fonte única
 */

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { FieldForm } from "@/components/admin/FieldForm";
import { FieldListNew } from "@/components/admin/FieldListNew";
import { RefreshButton } from "@/components/RefreshButton";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FieldService, Field, FieldInsert, FieldUpdate } from "@/services/supabase/fieldService";
import { AudioService } from "@/services/supabase/audioService";
import { useToast } from "@/hooks/use-toast";
import { Plus, Target, BarChart3 } from "lucide-react";

export default function AdminFieldsPageNew() {
  const [fields, setFields] = useState<Field[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadFields();
  }, []);

  const loadFields = async () => {
    setIsLoading(true);
    try {
      const fieldsData = await FieldService.getAll();
      setFields(fieldsData);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar campos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveField = async (fieldData: FieldInsert | (FieldUpdate & { id: string })) => {
    setIsLoading(true);
    try {
      if ('id' in fieldData) {
        // Editando campo existente
        await FieldService.update(fieldData.id, fieldData);
        toast({
          title: "Sucesso",
          description: "Campo atualizado com sucesso!",
        });
      } else {
        // Criando novo campo
        await FieldService.create(fieldData);
        toast({
          title: "Sucesso",
          description: "Campo criado com sucesso!",
        });
      }
      
      handleCloseForm();
      await loadFields();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditField = (field: Field) => {
    setEditingField(field);
    setIsFormOpen(true);
  };

  const handleDeleteField = async (fieldId: string) => {
    // Verificar se há áudios associados
    try {
      const audios = await AudioService.getByField(fieldId);
      if (audios.length > 0) {
        toast({
          title: "Erro",
          description: `Não é possível deletar este campo pois ele possui ${audios.length} áudio(s) associado(s). Delete os áudios primeiro.`,
          variant: "destructive",
        });
        return;
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao verificar áudios associados",
        variant: "destructive",
      });
      return;
    }

    if (!confirm("Tem certeza que deseja deletar este campo?")) return;
    
    setIsLoading(true);
    try {
      await FieldService.delete(fieldId);
      toast({
        title: "Sucesso",
        description: "Campo deletado com sucesso!",
      });
      await loadFields();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewField = () => {
    setEditingField(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingField(null);
  };

  const fieldStats = {
    total: fields.length,
    totalAudios: fields.reduce((sum, field) => sum + field.audio_count, 0),
    avgAudiosPerField: fields.length > 0 ? Math.round((fields.reduce((sum, field) => sum + field.audio_count, 0) / fields.length) * 10) / 10 : 0
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gerenciar Campos</h1>
            <p className="text-muted-foreground">
              Organize o conteúdo em campos de desenvolvimento
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <RefreshButton onRefresh={loadFields} />
            <Button onClick={handleNewField} disabled={isLoading}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Campo
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Campos</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fieldStats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Áudios</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fieldStats.totalAudios}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Média por Campo</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fieldStats.avgAudiosPerField}</div>
              <p className="text-xs text-muted-foreground">áudios por campo</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Campos */}
        <FieldListNew
          fields={fields}
          onEdit={handleEditField}
          onDelete={handleDeleteField}
        />

        {/* Formulário de Campo */}
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