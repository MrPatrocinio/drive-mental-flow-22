import { AdminLayout } from "@/components/admin/AdminLayout";
import { VideoManager } from "@/components/admin/VideoManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Página de gerenciamento de vídeos da Landing Page
 * Responsabilidade: Interface administrativa para upload e configuração de vídeos
 */
export default function AdminLandingVideosPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vídeos da Landing Page</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie os vídeos exibidos na página inicial
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Gestão de Vídeos</CardTitle>
            <CardDescription>
              Faça upload de vídeos e configure qual será exibido na landing page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VideoManager />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
