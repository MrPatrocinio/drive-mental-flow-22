
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  original_price: number;
  currency: string;
  interval: 'month' | 'year';
  interval_count: number;
  description: string;
  savings: string;
  popular: boolean;
  has_promotion: boolean;
  discount_percentage: number;
  promotion_end_date: string | null;
  promotion_label: string;
}

export interface SubscriptionPlansData {
  plans: SubscriptionPlan[];
  global_benefits: string[];
  button_text: string;
}

export interface SubscriptionPlansInsert {
  plans: SubscriptionPlan[];
  global_benefits: string[];
  button_text: string;
}

export class SubscriptionPlansService {
  static async get(): Promise<SubscriptionPlansData | null> {
    console.log('SubscriptionPlansService: Buscando planos de assinatura');
    const { data, error } = await supabase
      .from('landing_content')
      .select('*')
      .eq('section', 'subscription_plans')
      .maybeSingle();

    if (error) {
      console.error('SubscriptionPlansService: Erro ao buscar planos:', error);
      throw error;
    }

    if (!data) {
      console.log('SubscriptionPlansService: Nenhum plano encontrado');
      return null;
    }

    console.log('SubscriptionPlansService: Planos encontrados');
    return data.content as unknown as SubscriptionPlansData;
  }

  static async save(plansData: SubscriptionPlansInsert): Promise<SubscriptionPlansData> {
    console.log('SubscriptionPlansService: Salvando planos de assinatura:', plansData);
    
    try {
      // Primeiro, tenta fazer upsert com onConflict especificado
      const { data, error } = await supabase
        .from('landing_content')
        .upsert({
          section: 'subscription_plans',
          content: plansData as any,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'section'
        })
        .select()
        .single();

      if (error) {
        console.error('SubscriptionPlansService: Erro no upsert:', error);
        
        // Se falhou por constraint única, tenta estratégia alternativa
        if (error.code === '23505') {
          console.log('SubscriptionPlansService: Tentando update direto devido a constraint única');
          return await this.updateExistingRecord(plansData);
        }
        
        throw error;
      }

      console.log('SubscriptionPlansService: Planos salvos com sucesso via upsert');
      
      // Notificar mudança via DataSync
      this.notifyDataChange(plansData);

      return data.content as unknown as SubscriptionPlansData;
    } catch (error) {
      console.error('SubscriptionPlansService: Erro geral ao salvar:', error);
      throw error;
    }
  }

  private static async updateExistingRecord(plansData: SubscriptionPlansInsert): Promise<SubscriptionPlansData> {
    console.log('SubscriptionPlansService: Executando update direto');
    
    const { data, error } = await supabase
      .from('landing_content')
      .update({
        content: plansData as any,
        updated_at: new Date().toISOString()
      })
      .eq('section', 'subscription_plans')
      .select()
      .single();

    if (error) {
      console.error('SubscriptionPlansService: Erro no update direto:', error);
      throw error;
    }

    console.log('SubscriptionPlansService: Update direto executado com sucesso');
    
    // Notificar mudança via DataSync
    this.notifyDataChange(plansData);

    return data.content as unknown as SubscriptionPlansData;
  }

  private static notifyDataChange(plansData: SubscriptionPlansInsert): void {
    import('@/services/dataSync').then(({ DataSyncService }) => {
      DataSyncService.forceNotification('content_changed', { 
        event: 'UPDATE', 
        new: { subscription_plans: plansData } 
      });
    }).catch(error => {
      console.warn('SubscriptionPlansService: Erro ao notificar mudança:', error);
    });
  }

  static getDefaultPlansData(): SubscriptionPlansInsert {
    return {
      plans: [
        {
          id: 'quarterly',
          name: 'Trimestral',
          price: 89.90,
          original_price: 89.90,
          currency: 'R$',
          interval: 'month',
          interval_count: 3,
          description: 'Renovação automática a cada 3 meses',
          savings: 'Economize R$ 0,80',
          popular: false,
          has_promotion: false,
          discount_percentage: 0,
          promotion_end_date: null,
          promotion_label: ''
        },
        {
          id: 'semiannual',
          name: 'Semestral',
          price: 179.40,
          original_price: 179.40,
          currency: 'R$',
          interval: 'month',
          interval_count: 6,
          description: 'Renovação automática a cada 6 meses - Mais Popular',
          savings: 'Economize R$ 0,00',
          popular: true,
          has_promotion: false,
          discount_percentage: 0,
          promotion_end_date: null,
          promotion_label: ''
        },
        {
          id: 'annual',
          name: 'Anual',
          price: 358.80,
          original_price: 358.80,
          currency: 'R$',
          interval: 'year',
          interval_count: 1,
          description: 'Renovação automática a cada 12 meses',
          savings: 'Economize R$ 0,00',
          popular: false,
          has_promotion: false,
          discount_percentage: 0,
          promotion_end_date: null,
          promotion_label: ''
        }
      ],
      global_benefits: [
        'Acesso completo a todos os áudios especializados',
        'Atualizações constantes de conteúdo',
        'Garantia de Resultados em menos de 30 Dias',
        'Analytics Avançados e Relatórios Personalizados',
        'Instale novos padrões mentais em apenas 21 dias de escuta',
        'Áudios com frequências cientificamente comprovadas',
        'De mindset limitante para mentalidade abundante'
      ],
      button_text: 'Começar Agora'
    };
  }
}
