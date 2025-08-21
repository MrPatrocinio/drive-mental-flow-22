
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
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('SubscriptionPlansService: Nenhum plano encontrado');
        return null;
      }
      console.error('SubscriptionPlansService: Erro ao buscar planos:', error);
      throw error;
    }

    console.log('SubscriptionPlansService: Planos encontrados');
    return data.content as unknown as SubscriptionPlansData;
  }

  static async save(plansData: SubscriptionPlansInsert): Promise<SubscriptionPlansData> {
    console.log('SubscriptionPlansService: Salvando planos de assinatura:', plansData);
    
    const { data, error } = await supabase
      .from('landing_content')
      .upsert({
        section: 'subscription_plans',
        content: plansData as any,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('SubscriptionPlansService: Erro ao salvar planos:', error);
      throw error;
    }

    console.log('SubscriptionPlansService: Planos salvos com sucesso');
    
    // Notificar mudança via DataSync
    import('@/services/dataSync').then(({ DataSyncService }) => {
      DataSyncService.forceNotification('content_changed', { event: 'UPDATE', new: { subscription_plans: plansData } });
    });

    return data.content as unknown as SubscriptionPlansData;
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
          price: 159.90,
          original_price: 179.40,
          currency: 'R$',
          interval: 'month',
          interval_count: 6,
          description: 'Renovação automática a cada 6 meses - Mais Popular',
          savings: 'Economize R$ 20,40',
          popular: true,
          has_promotion: true,
          discount_percentage: 11,
          promotion_end_date: '2025-01-31T23:59:59',
          promotion_label: 'OFERTA ESPECIAL'
        },
        {
          id: 'annual',
          name: 'Anual',
          price: 299.90,
          original_price: 358.80,
          currency: 'R$',
          interval: 'year',
          interval_count: 1,
          description: 'Renovação automática a cada 12 meses',
          savings: 'Economize R$ 59,80',
          popular: false,
          has_promotion: true,
          discount_percentage: 17,
          promotion_end_date: '2025-01-31T23:59:59',
          promotion_label: 'MELHOR OFERTA'
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
