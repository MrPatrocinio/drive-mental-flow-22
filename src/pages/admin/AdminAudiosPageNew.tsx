/**
 * Admin Audios Page - Página de gerenciamento de áudios com Supabase
 * Responsabilidade: Interface completa para CRUD de áudios
 * Princípio SRP: Apenas gerenciamento de áudios
 * Princípio SSOT: Usa Supabase como fonte única
 */

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AudioForm } from "@/components/admin/AudioForm";
import { AudioUploadForm } from "@/components/admin/AudioUploadForm";
import { AudioList } from "@/components/admin/AudioListNew";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AudioService, Audio, AudioWithFile, AudioUpdate } from "@/services/supabase/audioService";
import { FieldService, Field } from "@/services/supabase/fieldService";
import { useToast } from "@/hooks/use-toast";
import { RefreshButton } from "@/components/RefreshButton";
import { Plus, Music, Upload, Edit, BarChart3 } from "lucide-react";

type ViewMode = "list" | "upload" | "edit";

export default function AdminAudiosPageNew() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [audios, setAudios] = useState<Audio[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [editingAudio, setEditingAudio] = useState<Audio | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [audiosData, fieldsData] = await Promise.all([
        AudioService.getAll(),
        FieldService.getAll()
      ]);
      setAudios(audiosData);
      setFields(fieldsData);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar dados",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAudio = async (audioData: AudioWithFile) => {
    setIsLoading(true);
    setFormErrors([]);
    
    try {
      await AudioService.create(audioData);
      toast({
        title: "Sucesso",
        description: "Áudio criado com sucesso!",
      });
      setViewMode("list");
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      setFormErrors([message]);
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAudio = async (audioData: AudioUpdate & { id?: string }) => {
    if (!audioData.id) return;
    
    setIsLoading(true);
    setFormErrors([]);
    
    try {
      await AudioService.update(audioData.id, audioData);
      toast({
        title: "Sucesso",
        description: "Áudio atualizado com sucesso!",
      });
      setViewMode("list");
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      setFormErrors([message]);
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAudio = (audio: Audio) => {
    setEditingAudio(audio);
    setViewMode("edit");
    setFormErrors([]);
  };

  const handleDeleteAudio = async (audioId: string) => {
    if (!confirm("Tem certeza que deseja deletar este áudio?")) return;
    
    setIsLoading(true);
    try {
      await AudioService.delete(audioId);
      toast({
        title: "Sucesso",
        description: "Áudio deletado com sucesso!",
      });
      await loadData();
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

  const handleCancel = () => {
    setViewMode("list");
    setEditingAudio(undefined);
    setFormErrors([]);
  };

  const audioStats = {
    total: audios.length,
    byField: fields.map(field => ({
      field: field.title,
      count: audios.filter(audio => audio.field_id === field.id).length
    }))
  };

  const renderContent = () => {
    switch (viewMode) {
      case "upload":
        return (
          <div className="flex justify-center">
            <AudioUploadForm
              fields={fields}
              onSubmit={handleCreateAudio}
              onCancel={handleCancel}
              isLoading={isLoading}
              errors={formErrors}
            />
          </div>
        );
      
      case "edit":
        return (
          <div className="flex justify-center">
            <AudioForm
              audio={editingAudio}
              fields={fields}
              onSubmit={handleUpdateAudio}
              onCancel={handleCancel}
              isLoading={isLoading}
              errors={formErrors}
            />
          </div>
        );
      
      default:
        return (
          <div className="space-y-6">
            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Áudios</CardTitle>
                  <Music className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{audioStats.total}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Campos Ativos</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{fields.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Por Campo</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {audioStats.byField.slice(0, 3).map((stat) => (
                      <div key={stat.field} className="flex items-center justify-between text-sm">
                        <span className="truncate">{stat.field}</span>
                        <Badge variant="secondary">{stat.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Áudios */}
            <AudioList
              audios={audios}
              fields={fields}
              onEdit={handleEditAudio}
              onDelete={handleDeleteAudio}
            />
          </div>
        );
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gerenciar Áudios</h1>
            <p className="text-muted-foreground">
              Faça upload e gerencie os áudios da plataforma
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <RefreshButton onRefresh={loadData} />
            {viewMode === "list" && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setViewMode("upload")}
                  disabled={isLoading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Áudio
                </Button>
              </>
            )}
            {viewMode !== "list" && (
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={isLoading}
              >
                Voltar à Lista
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </AdminLayout>
  );
}