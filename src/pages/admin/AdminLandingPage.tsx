import { AdminLayout } from "@/components/admin/AdminLayout";
import { LandingContentForm } from "@/components/admin/LandingContentForm";
import { VideoManager } from "@/components/admin/VideoManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshButton } from "@/components/RefreshButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Save, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminLandingPage() {
  const { toast } = useToast();

  const handlePreview = () => {
    window.open("/", "_blank");
  };

  const handleSave = () => {
    toast({
      title: "Alterações salvas!",
      description: "O conteúdo da landing page foi atualizado com sucesso.",
    });
  };

  return (
    <AdminLayout title="Editar Landing Page">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Conteúdo da Landing Page
            </h1>
            <p className="text-muted-foreground">
              Edite todas as seções da página inicial do Drive Mental
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <RefreshButton />
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-2" />
              Visualizar Site
            </Button>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content">Conteúdo da Página</TabsTrigger>
            <TabsTrigger value="videos">
              <Play className="h-4 w-4 mr-2" />
              Gerenciar Vídeos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            {/* Content Form */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Editar Conteúdo</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Save className="h-4 w-4" />
                    <span>Salvo automaticamente</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <LandingContentForm />
              </CardContent>
            </Card>

            {/* Help Section */}
            <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">💡 Dicas de Edição</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2">Seção Hero</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Use títulos impactantes e diretos</li>
                      <li>• Mantenha o subtítulo claro e convincente</li>
                      <li>• Botões com verbos de ação funcionam melhor</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Funcionalidades</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Use nomes de ícones do Lucide React</li>
                      <li>• Títulos curtos e benefícios claros</li>
                      <li>• Foque nos principais diferenciais</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Preços</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Liste todos os benefícios importantes</li>
                      <li>• Use linguagem que gere valor</li>
                      <li>• Mantenha a lista organizada</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Visualização</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Use o botão "Visualizar Site" para ver mudanças</li>
                      <li>• Teste em diferentes dispositivos</li>
                      <li>• Alterações são salvas automaticamente</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="videos" className="space-y-6">
            <VideoManager />
            
            {/* Video Help Section */}
            <Card className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-lg">🎬 Dicas para Vídeos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2">URLs do YouTube</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Aceita qualquer formato de URL do YouTube</li>
                      <li>• youtube.com/watch?v=... será convertido automaticamente</li>
                      <li>• youtu.be/... também é aceito</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Vídeo Ativo</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Apenas um vídeo pode estar ativo por vez</li>
                      <li>• Use o botão de olho para ativar/desativar</li>
                      <li>• Vídeo ativo aparece na página inicial</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}