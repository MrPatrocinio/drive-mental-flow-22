import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { notificationService } from "@/services/notificationService";
import { UserManagementService } from "@/services/supabase/userManagementService";
import { useToast } from "@/hooks/use-toast";
import { Bell, Send, Users } from "lucide-react";

export interface NotificationManagerProps {
  onNotificationSent?: () => void;
}

/**
 * Gerenciador de notificações in-app
 * Responsabilidade: Interface para envio de notificações internas
 */
export const NotificationManager = ({ onNotificationSent }: NotificationManagerProps) => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<'info' | 'success' | 'warning' | 'error'>('info');
  const [audience, setAudience] = useState<'all' | 'subscribers' | 'non_subscribers'>('all');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSendNotification = async () => {
    if (!title || !message) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o título e a mensagem",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Buscar usuários baseado na audiência
      const { data: users, error } = await UserManagementService.getAllUsersWithSubscription();
      
      if (error || !users) {
        throw new Error(error || "Erro ao buscar usuários");
      }

      const targetUsers = users.filter(user => {
        if (audience === 'all') return true;
        if (audience === 'subscribers') return user.subscribed;
        if (audience === 'non_subscribers') return !user.subscribed;
        return false;
      });

      if (targetUsers.length === 0) {
        toast({
          title: "Nenhum usuário encontrado",
          description: "Verifique a audiência selecionada",
          variant: "destructive",
        });
        return;
      }

      // Enviar notificação para cada usuário
      const promises = targetUsers.map(user => 
        notificationService.createNotification(user.user_id, {
          title,
          message,
          type,
          data: {
            audience,
            sentAt: new Date().toISOString()
          }
        })
      );

      await Promise.all(promises);

      toast({
        title: "Notificações enviadas!",
        description: `Notificação enviada para ${targetUsers.length} usuário(s)`,
      });

      // Resetar formulário
      setTitle("");
      setMessage("");
      setType('info');
      
      onNotificationSent?.();
    } catch (error: any) {
      console.error("Erro ao enviar notificação:", error);
      toast({
        title: "Erro ao enviar notificação",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (notificationType: string) => {
    switch (notificationType) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  const getAudienceDescription = () => {
    switch (audience) {
      case 'all': return 'Todos os usuários';
      case 'subscribers': return 'Apenas assinantes';
      case 'non_subscribers': return 'Apenas não-assinantes';
      default: return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Enviar Notificação In-App
        </CardTitle>
        <CardDescription>
          Envie notificações que aparecerão no sistema para os usuários
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="notif-title">Título da Notificação</Label>
          <Input
            id="notif-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Novos áudios disponíveis!"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notif-message">Mensagem</Label>
          <Textarea
            id="notif-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Adicione mais detalhes sobre a notificação..."
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label>Tipo de Notificação</Label>
          <Select value={type} onValueChange={(value: any) => setType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="info">
                <span className={getTypeColor('info')}>ℹ️ Informação</span>
              </SelectItem>
              <SelectItem value="success">
                <span className={getTypeColor('success')}>✅ Sucesso</span>
              </SelectItem>
              <SelectItem value="warning">
                <span className={getTypeColor('warning')}>⚠️ Aviso</span>
              </SelectItem>
              <SelectItem value="error">
                <span className={getTypeColor('error')}>❌ Erro</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Audiência</Label>
          <Select value={audience} onValueChange={(value: any) => setAudience(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Todos os Usuários
                </div>
              </SelectItem>
              <SelectItem value="subscribers">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Apenas Assinantes
                </div>
              </SelectItem>
              <SelectItem value="non_subscribers">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Apenas Não-Assinantes
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            {getAudienceDescription()}
          </p>
        </div>

        <Button 
          onClick={handleSendNotification} 
          disabled={loading}
          className="w-full"
        >
          <Send className="h-4 w-4 mr-2" />
          {loading ? "Enviando..." : "Enviar Notificação"}
        </Button>
      </CardContent>
    </Card>
  );
};