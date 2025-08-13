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
import { AudioService, Audio, AudioWithFile, AudioUpdate, AudioInsert } from "@/services/supabase/audioService";
import { supabase } from "@/integrations/supabase/client";
import { FieldService, Field } from "@/services/supabase/fieldService";
import { useToast } from "@/hooks/use-toast";
import { RefreshButton } from "@/components/RefreshButton";
import { AudioDiagnostics } from "@/components/admin/AudioDiagnostics";
import { Plus, Music, Upload, Edit, BarChart3, Activity, Crown, Users } from "lucide-react";

type ViewMode = "list" | "upload" | "edit" | "diagnostics";

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
      let audioUrl = audioData.url || '';
      
      // Se há um arquivo, fazer upload para o Supabase Storage
      if (audioData.file) {
        console.log('Iniciando upload do arquivo:', audioData.file.name);
        
        // Gerar nome único para o arquivo
        const fileExtension = audioData.file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
        
        // Upload para o bucket 'audios'
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('audios')
          .upload(fileName, audioData.file, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (uploadError) {
          console.error('Erro no upload:', uploadError);
          throw new Error(`Erro no upload: ${uploadError.message}`);
        }
        
        console.log('Upload realizado com sucesso:', uploadData.path);
        
        // Obter URL pública do arquivo
        const { data: urlData } = supabase.storage
          .from('audios')
          .getPublicUrl(uploadData.path);
        
        audioUrl = urlData.publicUrl;
        console.log('URL pública gerada:', audioUrl);
      }
      
      // Convert AudioWithFile to AudioInsert
      const audioInsert: AudioInsert = {
        title: audioData.title,
        duration: audioData.duration,
        field_id: audioData.field_id,
        tags: audioData.tags || [],
        url: audioUrl,
        is_premium: audioData.is_premium || false
      };
      
      console.log('Criando áudio no banco:', audioInsert);
      await AudioService.create(audioInsert);
      
      toast({
        title: "Sucesso",
        description: "Áudio criado com sucesso!",
      });
      setViewMode("list");
      await loadData();
    } catch (error) {
      console.error('Erro completo:', error);
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

  const handleUpdateAudio = async (audioData: AudioWithFile & { id?: string }) => {
    if (!audioData.id) return;
    
    setIsLoading(true);
    setFormErrors([]);
    
    try {
      let audioUrl = audioData.url || '';
      
      // Se há um arquivo novo, fazer upload para o Supabase Storage
      if (audioData.file) {
        console.log('Iniciando upload do novo arquivo:', audioData.file.name);
        
        // Gerar nome único para o arquivo
        const fileExtension = audioData.file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
        
        // Upload para o bucket 'audios'
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('audios')
          .upload(fileName, audioData.file, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (uploadError) {
          console.error('Erro no upload:', uploadError);
          throw new Error(`Erro no upload: ${uploadError.message}`);
        }
        
        console.log('Upload realizado com sucesso:', uploadData.path);
        
        // Obter URL pública do arquivo
        const { data: urlData } = supabase.storage
          .from('audios')
          .getPublicUrl(uploadData.path);
        
        audioUrl = urlData.publicUrl;
        console.log('URL pública gerada:', audioUrl);
      }
      
      // Convert AudioWithFile to AudioUpdate
      const audioUpdate: AudioUpdate = {
        title: audioData.title,
        duration: audioData.duration,
        field_id: audioData.field_id,
        tags: audioData.tags || [],
        url: audioUrl,
        is_premium: audioData.is_premium || false
      };
      
      console.log('Atualizando áudio no banco:', audioUpdate);
      await AudioService.update(audioData.id, audioUpdate);
      
      toast({
        title: "Sucesso",
        description: "Áudio atualizado com sucesso!",
      });
      setViewMode("list");
      await loadData();
    } catch (error) {
      console.error('Erro completo:', error);
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
    premium: audios.filter(audio => audio.is_premium).length,
    free: audios.filter(audio => !audio.is_premium).length,
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  <CardTitle className="text-sm font-medium">Áudios Premium</CardTitle>
                  <Crown className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{audioStats.premium}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Áudios Gratuitos</CardTitle>
                  <Users className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{audioStats.free}</div>
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
                  onClick={() => setViewMode("diagnostics")}
                  disabled={isLoading}
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Diagnóstico
                </Button>
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
        {viewMode === "diagnostics" ? (
          <AudioDiagnostics />
        ) : (
          renderContent()
        )}
      </div>
    </AdminLayout>
  );
}
