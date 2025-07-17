/**
 * Admin Audios Page - Responsável pela lógica da página de gerenciamento de áudios
 * Responsabilidade: Orquestrar interação entre UI e serviços
 * Princípio SRP: Apenas lógica da página de áudios
 * Princípio SSOT: Centraliza estado da página
 */

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AudioForm } from "@/components/admin/AudioForm";
import { AudioList } from "@/components/admin/AudioList";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AudioManagementService, AudioFormData } from "@/services/audioManagementService";
import { ContentService, EditableAudio } from "@/services/contentService";
import { SyncService } from "@/services/syncService";
import { useSync } from "@/hooks/useSync";
import { useToast } from "@/hooks/use-toast";
import { RefreshButton } from "@/components/RefreshButton";
import { Plus, Music, BarChart3 } from "lucide-react";

type ViewMode = "list" | "create" | "edit";

export default function AdminAudiosPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [audios, setAudios] = useState<EditableAudio[]>([]);
  const [editingAudio, setEditingAudio] = useState<EditableAudio | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const { toast } = useToast();

  const fields = ContentService.getEditableFields();
  const audioStats = AudioManagementService.getAudioStats();

  // Sincronização em tempo real
  useSync((eventType) => {
    if (eventType === 'audios_updated' || eventType === 'fields_updated') {
      loadAudios();
    }
  }, ['audios_updated', 'fields_updated']);

  useEffect(() => {
    loadAudios();
  }, []);

  const loadAudios = () => {
    setIsLoading(true);
    try {
      const allAudios = AudioManagementService.getAllAudios();
      setAudios(allAudios);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar áudios",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAudio = async (audioData: AudioFormData) => {
    setIsLoading(true);
    setFormErrors([]);

    try {
      const errors = AudioManagementService.validateAudioData(audioData);
      if (errors.length > 0) {
        setFormErrors(errors);
        return;
      }

      AudioManagementService.createAudio(audioData);
      SyncService.notifyAudiosUpdated();
      SyncService.notifyFieldsUpdated();
      loadAudios();
      setViewMode("list");
      
      toast({
        title: "Sucesso",
        description: "Áudio criado com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar áudio",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAudio = async (audioData: AudioFormData) => {
    if (!editingAudio) return;

    setIsLoading(true);
    setFormErrors([]);

    try {
      const errors = AudioManagementService.validateAudioData(audioData);
      if (errors.length > 0) {
        setFormErrors(errors);
        return;
      }

      const result = AudioManagementService.updateAudio(editingAudio.id, audioData);
      if (!result) {
        toast({
          title: "Erro",
          description: "Áudio não encontrado",
          variant: "destructive"
        });
        return;
      }

      SyncService.notifyAudiosUpdated();
      SyncService.notifyFieldsUpdated();
      loadAudios();
      setViewMode("list");
      setEditingAudio(undefined);
      
      toast({
        title: "Sucesso",
        description: "Áudio atualizado com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar áudio",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAudio = async (audioId: string) => {
    setIsLoading(true);

    try {
      const success = AudioManagementService.deleteAudio(audioId);
      if (!success) {
        toast({
          title: "Erro",
          description: "Áudio não encontrado",
          variant: "destructive"
        });
        return;
      }

      SyncService.notifyAudiosUpdated();
      SyncService.notifyFieldsUpdated();
      loadAudios();
      
      toast({
        title: "Sucesso",
        description: "Áudio excluído com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir áudio",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAudio = (audio: EditableAudio) => {
    setEditingAudio(audio);
    setFormErrors([]);
    setViewMode("edit");
  };

  const handleCancel = () => {
    setViewMode("list");
    setEditingAudio(undefined);
    setFormErrors([]);
  };

  const renderStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Music className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total de Áudios</p>
              <p className="text-2xl font-bold">{audioStats.totalAudios}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Campos Ativos</p>
              <p className="text-2xl font-bold">{audioStats.totalFields}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Áudios por Campo</p>
            <div className="space-y-1">
              {audioStats.audiosByField.slice(0, 3).map((field) => (
                <div key={field.fieldId} className="flex justify-between">
                  <span className="text-xs">{field.fieldTitle}</span>
                  <Badge variant="secondary">{field.audioCount}</Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (viewMode) {
      case "create":
      case "edit":
        return (
          <div className="flex justify-center">
            <AudioForm
              audio={editingAudio}
              onSubmit={viewMode === "create" ? handleCreateAudio : handleUpdateAudio}
              onCancel={handleCancel}
              isLoading={isLoading}
              errors={formErrors}
            />
          </div>
        );

      default:
        return (
          <>
            {renderStats()}
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Gerenciar Áudios</CardTitle>
                <div className="flex gap-2">
                  <RefreshButton />
                  <Button onClick={() => setViewMode("create")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Áudio
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <AudioList
                  audios={audios}
                  fields={fields}
                  onEdit={handleEditAudio}
                  onDelete={handleDeleteAudio}
                  onRefresh={loadAudios}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </>
        );
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Áudios</h1>
          <p className="text-muted-foreground">
            Gerencie todos os áudios do sistema
          </p>
        </div>

        {renderContent()}
      </div>
    </AdminLayout>
  );
}