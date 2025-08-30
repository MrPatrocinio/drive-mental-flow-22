import React from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailCampaignForm } from "@/components/admin/communication/EmailCampaignForm";
import { NotificationManager } from "@/components/admin/communication/NotificationManager";
import { Mail, Bell, MessageSquare } from "lucide-react";

/**
 * Página de gerenciamento de comunicação
 * Responsabilidade: Coordenação da interface de comunicação com usuários
 */
export default function AdminCommunicationPage() {
  console.log('AdminCommunicationPage: Renderizando', { React: typeof React });
  
  // Debug: verificar se React está disponível
  if (!React) {
    console.error('AdminCommunicationPage: React não está disponível', { React });
    return <div>Erro: React não disponível</div>;
  }
  const handleCampaignSent = () => {
    // Callback quando campanha for enviada
    console.log("Campanha enviada com sucesso");
  };

  const handleNotificationSent = () => {
    // Callback quando notificação for enviada
    console.log("Notificação enviada com sucesso");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Comunicação</h1>
          <p className="text-muted-foreground">
            Gerencie comunicação com usuários via email e notificações
          </p>
        </div>

        <Tabs defaultValue="email" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Marketing
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notificações In-App
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <EmailCampaignForm onCampaignSent={handleCampaignSent} />
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Templates Disponíveis
                  </CardTitle>
                  <CardDescription>
                    Templates automáticos já configurados
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">📧 Email de Boas-vindas</h4>
                    <p className="text-sm text-muted-foreground">
                      Enviado automaticamente quando um usuário se cadastra
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">✅ Confirmação de Pagamento</h4>
                    <p className="text-sm text-muted-foreground">
                      Enviado quando o pagamento é processado com sucesso
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">📅 Lembrete de Renovação</h4>
                    <p className="text-sm text-muted-foreground">
                      Enviado antes da renovação da assinatura
                    </p>
                  </div>
                  
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Dica:</strong> Os templates automáticos são acionados por eventos do sistema. 
                      Use esta seção para campanhas manuais e newsletters.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <NotificationManager onNotificationSent={handleNotificationSent} />
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Como Funcionam as Notificações
                  </CardTitle>
                  <CardDescription>
                    Entenda o sistema de notificações in-app
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">🔔 Notificações In-App</h4>
                    <p className="text-sm text-muted-foreground">
                      Aparecem no sino de notificações quando o usuário está logado na plataforma
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">📱 Tempo Real</h4>
                    <p className="text-sm text-muted-foreground">
                      As notificações são entregues instantaneamente via WebSocket
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">🎯 Segmentação</h4>
                    <p className="text-sm text-muted-foreground">
                      Escolha enviar para todos, apenas assinantes ou não-assinantes
                    </p>
                  </div>
                  
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✨ <strong>Ideal para:</strong> Anúncios de novos conteúdos, 
                      atualizações do sistema, promoções limitadas.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}