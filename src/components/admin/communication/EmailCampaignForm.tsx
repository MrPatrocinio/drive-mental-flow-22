import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { EmailService } from "@/services/emailService";
import { UserManagementService } from "@/services/supabase/userManagementService";
import { useToast } from "@/hooks/use-toast";
import { Send, Users, Mail } from "lucide-react";

export interface EmailCampaignFormProps {
  onCampaignSent?: () => void;
}

/**
 * Formulário para criação e envio de campanhas de email
 * Responsabilidade: Interface para campanhas de email marketing
 */
export const EmailCampaignForm = ({ onCampaignSent }: EmailCampaignFormProps) => {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [audience, setAudience] = useState<'all' | 'subscribers' | 'non_subscribers'>('subscribers');
  const [testMode, setTestMode] = useState(true);
  const [testEmail, setTestEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSendCampaign = async () => {
    if (!subject || !content) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o assunto e o conteúdo do email",
        variant: "destructive",
      });
      return;
    }

    if (testMode && !testEmail) {
      toast({
        title: "Email de teste necessário",
        description: "Informe um email para o modo de teste",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      let emails: string[] = [];

      if (testMode) {
        emails = [testEmail];
      } else {
        // Buscar emails baseado na audiência selecionada
        const { data: users, error } = await UserManagementService.getAllUsersWithSubscription();
        
        if (error || !users) {
          throw new Error(error || "Erro ao buscar usuários");
        }

        emails = users
          .filter(user => {
            if (audience === 'all') return true;
            if (audience === 'subscribers') return user.subscribed;
            if (audience === 'non_subscribers') return !user.subscribed;
            return false;
          })
          .map(user => user.email || `noemail+${user.user_id}@placeholder.com`) // Usar email ou placeholder único
          .filter(Boolean);
      }

      if (emails.length === 0) {
        toast({
          title: "Nenhum destinatário encontrado",
          description: "Verifique a audiência selecionada",
          variant: "destructive",
        });
        return;
      }

      const { success, error } = await EmailService.sendNewsletterEmail(
        emails,
        subject,
        content
      );

      if (success) {
        toast({
          title: testMode ? "Email de teste enviado!" : "Campanha enviada!",
          description: `Email enviado para ${emails.length} destinatário(s)`,
        });
        
        // Resetar formulário
        setSubject("");
        setContent("");
        setTestEmail("");
        
        onCampaignSent?.();
      } else {
        throw new Error(error || "Erro ao enviar campanha");
      }
    } catch (error: any) {
      console.error("Erro ao enviar campanha:", error);
      toast({
        title: "Erro ao enviar campanha",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getAudienceDescription = () => {
    switch (audience) {
      case 'all': return 'Todos os usuários cadastrados';
      case 'subscribers': return 'Apenas usuários com assinatura ativa';
      case 'non_subscribers': return 'Apenas usuários sem assinatura';
      default: return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Criar Campanha de Email
        </CardTitle>
        <CardDescription>
          Envie emails para seus usuários de forma segmentada
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="subject">Assunto do Email</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Ex: Novos áudios disponíveis no Drive Mental!"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Conteúdo do Email (HTML)</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="<h2>Olá!</h2><p>Temos novidades incríveis para você...</p>"
            rows={8}
          />
        </div>

        <div className="space-y-2">
          <Label>Audiência</Label>
          <Select value={audience} onValueChange={(value: any) => setAudience(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="subscribers">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Assinantes Ativos
                </div>
              </SelectItem>
              <SelectItem value="non_subscribers">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Usuários Sem Assinatura
                </div>
              </SelectItem>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Todos os Usuários
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            {getAudienceDescription()}
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="testMode"
              checked={testMode}
              onCheckedChange={(checked) => setTestMode(checked as boolean)}
            />
            <Label htmlFor="testMode">Modo de teste (enviar apenas para um email)</Label>
          </div>

          {testMode && (
            <div className="space-y-2">
              <Label htmlFor="testEmail">Email de Teste</Label>
              <Input
                id="testEmail"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="seu-email@exemplo.com"
              />
            </div>
          )}
        </div>

        <Button 
          onClick={handleSendCampaign} 
          disabled={loading}
          className="w-full"
        >
          <Send className="h-4 w-4 mr-2" />
          {loading ? "Enviando..." : testMode ? "Enviar Teste" : "Enviar Campanha"}
        </Button>
      </CardContent>
    </Card>
  );
};