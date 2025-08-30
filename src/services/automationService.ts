import { supabase } from "@/integrations/supabase/client";
import { EmailService } from "@/services/emailService";

export interface AutomationRule {
  id: string;
  name: string;
  trigger: 'user_signup' | 'subscription_expired' | 'inactive_user' | 'trial_ending';
  condition: string;
  action: 'send_email' | 'add_tag' | 'send_notification';
  emailTemplate?: 'welcome' | 'retention' | 'winback' | 'trial_reminder';
  isActive: boolean;
  lastTriggered?: string;
  triggerCount: number;
}

export interface AutomationStats {
  totalAutomations: number;
  activeAutomations: number;
  totalTriggers: number;
  successRate: number;
}

/**
 * Serviço responsável por automações de marketing
 * Responsabilidade: Gerenciamento de automações baseadas em comportamento
 */
export class AutomationService {
  
  /**
   * Lista todas as automações configuradas
   */
  static async getAutomations(): Promise<{ data: AutomationRule[] | null; error: string | null }> {
    try {
      // Simulando automações (em produção, viriam do banco)
      const automations: AutomationRule[] = [
        {
          id: '1',
          name: 'Boas-vindas para Novos Usuários',
          trigger: 'user_signup',
          condition: 'Imediatamente após cadastro',
          action: 'send_email',
          emailTemplate: 'welcome',
          isActive: true,
          lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          triggerCount: 45,
        },
        {
          id: '2',
          name: 'Reativação de Usuários Inativos',
          trigger: 'inactive_user',
          condition: 'Não acessou em 7 dias',
          action: 'send_email',
          emailTemplate: 'retention',
          isActive: true,
          lastTriggered: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          triggerCount: 12,
        },
        {
          id: '3',
          name: 'Recuperação de Assinatura Expirada',
          trigger: 'subscription_expired',
          condition: 'Assinatura expirada há 3 dias',
          action: 'send_email',
          emailTemplate: 'winback',
          isActive: true,
          lastTriggered: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          triggerCount: 8,
        },
        {
          id: '4',
          name: 'Lembrete de Trial Expirando',
          trigger: 'trial_ending',
          condition: 'Trial expira em 2 dias',
          action: 'send_email',
          emailTemplate: 'trial_reminder',
          isActive: false, // Desativada como exemplo
          triggerCount: 0,
        },
      ];

      return { data: automations, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Ativa ou desativa uma automação
   */
  static async toggleAutomation(automationId: string, isActive: boolean): Promise<{ success: boolean; error: string | null }> {
    try {
      // Simular toggle de automação (em produção, atualizaria no banco)
      console.log(`Automação ${automationId} ${isActive ? 'ativada' : 'desativada'}`);
      
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Executa automação manual para teste
   */
  static async triggerAutomation(automationId: string, userEmail?: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: automations } = await this.getAutomations();
      const automation = automations?.find(a => a.id === automationId);
      
      if (!automation) {
        return { success: false, error: "Automação não encontrada" };
      }

      if (!automation.isActive) {
        return { success: false, error: "Automação está desativada" };
      }

      // Executar ação baseada no tipo
      if (automation.action === 'send_email' && automation.emailTemplate) {
        const testEmail = userEmail || 'teste@exemplo.com';
        
        let emailData = {};
        
        switch (automation.emailTemplate) {
          case 'welcome':
            emailData = {
              name: 'Usuário Teste',
              loginUrl: window.location.origin,
            };
            break;
          case 'retention':
            emailData = {
              name: 'Usuário Teste',
              lastAccess: '7 dias atrás',
              recommendedAudios: ['Foco e Concentração', 'Relaxamento'],
            };
            break;
          case 'winback':
            emailData = {
              name: 'Usuário Teste',
              discount: '50%',
              validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
            };
            break;
          case 'trial_reminder':
            emailData = {
              name: 'Usuário Teste',
              daysLeft: 2,
              upgradeUrl: window.location.origin + '/assinatura',
            };
            break;
        }

        const { success, error } = await EmailService.sendTemplateEmail(
          testEmail,
          automation.emailTemplate,
          emailData
        );

        if (!success) {
          return { success: false, error: error || "Erro ao enviar email" };
        }
      }

      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Busca estatísticas das automações
   */
  static async getAutomationStats(): Promise<{ data: AutomationStats | null; error: string | null }> {
    try {
      const { data: automations } = await this.getAutomations();
      
      if (!automations) {
        return { data: null, error: "Erro ao carregar automações" };
      }

      const totalAutomations = automations.length;
      const activeAutomations = automations.filter(a => a.isActive).length;
      const totalTriggers = automations.reduce((sum, a) => sum + a.triggerCount, 0);
      
      // Simular taxa de sucesso (em produção, viria de logs de execução)
      const successRate = Math.random() * 20 + 80; // 80-100%

      const stats: AutomationStats = {
        totalAutomations,
        activeAutomations,
        totalTriggers,
        successRate: Math.round(successRate * 100) / 100,
      };

      return { data: stats, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Cria nova automação
   */
  static async createAutomation(automation: Omit<AutomationRule, 'id' | 'triggerCount' | 'lastTriggered'>): Promise<{ success: boolean; error: string | null }> {
    try {
      // Simular criação de automação (em produção, salvaria no banco)
      console.log('Nova automação criada:', automation);
      
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Remove automação
   */
  static async deleteAutomation(automationId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      // Simular remoção (em produção, removeria do banco)
      console.log(`Automação ${automationId} removida`);
      
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}