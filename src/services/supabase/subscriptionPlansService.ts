
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
  is_active: boolean;
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
    console.log('🔍 [DEBUG] SubscriptionPlansService.save() - Dados recebidos:', plansData);
    console.log('🔍 [DEBUG] Planos com is_active:', plansData.plans.map(p => ({ 
      id: p.id, 
      name: p.name, 
      is_active: p.is_active 
    })));
    
    try {
      const dataToSave = {
        section: 'subscription_plans',
        content: plansData as any,
        updated_at: new Date().toISOString()
      };
      
      console.log('🔍 [DEBUG] Dados que serão salvos no Supabase:', JSON.stringify(dataToSave, null, 2));
      
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
        console.error('🔴 [DEBUG] Erro no upsert:', error);
        
        // Se falhou por constraint única, tenta estratégia alternativa
        if (error.code === '23505') {
          console.log('🔍 [DEBUG] Tentando update direto devido a constraint única');
          return await this.updateExistingRecord(plansData);
        }
        
        throw error;
      }

      console.log('✅ [DEBUG] Upsert bem-sucedido! Dados retornados:', JSON.stringify(data, null, 2));
      console.log('✅ [DEBUG] Planos salvos com is_active:', (data.content as any).plans.map((p: any) => ({ 
        id: p.id, 
        name: p.name, 
        is_active: p.is_active 
      })));
      
      // Notificar mudança via DataSync
      this.notifyDataChange(plansData);

      return data.content as unknown as SubscriptionPlansData;
    } catch (error) {
      console.error('SubscriptionPlansService: Erro geral ao salvar:', error);
      throw error;
    }
  }

  private static async updateExistingRecord(plansData: SubscriptionPlansInsert): Promise<SubscriptionPlansData> {
    console.log('🔍 [DEBUG] Executando update direto com dados:', JSON.stringify(plansData.plans.map(p => ({ 
      id: p.id, 
      is_active: p.is_active 
    })), null, 2));
    
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
      console.error('🔴 [DEBUG] Erro no update direto:', error);
      throw error;
    }

    console.log('✅ [DEBUG] Update direto bem-sucedido! Dados retornados:', JSON.stringify(data, null, 2));
    console.log('✅ [DEBUG] Planos atualizados com is_active:', (data.content as any).plans.map((p: any) => ({ 
      id: p.id, 
      name: p.name, 
      is_active: p.is_active 
    })));
    
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
          id: 'annual',
          name: 'Anual',
          price: 197.00,
          original_price: 197.00,
          currency: 'R$',
          interval: 'year',
          interval_count: 1,
          description: 'Renovação automática a cada 12 meses',
          savings: '',
          popular: true,
          is_active: true,
          has_promotion: false,
          discount_percentage: 0,
          promotion_end_date: null,
          promotion_label: ''
        },
        {
          id: 'annual_promo',
          name: 'Anual Promocional',
          price: 97.00,
          original_price: 197.00,
          currency: 'R$',
          interval: 'year',
          interval_count: 1,
          description: 'Renovação automática a cada 12 meses - Oferta Especial',
          savings: 'Economize R$ 100,00',
          popular: false,
          is_active: true,
          has_promotion: true,
          discount_percentage: 50,
          promotion_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          promotion_label: 'OFERTA LIMITADA'
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
