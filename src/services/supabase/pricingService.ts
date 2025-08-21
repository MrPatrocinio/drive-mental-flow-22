
import { supabase } from '@/integrations/supabase/client';

export interface PricingInfo {
  id?: string;
  price: number;
  currency: string;
  payment_type: string;
  access_type: string;
  benefits: string[];
  button_text: string;
  // Promotion fields
  has_promotion?: boolean;
  original_price?: number;
  discount_percentage?: number;
  promotion_end_date?: string;
  promotion_label?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PricingInsert {
  price: number;
  currency: string;
  payment_type: string;
  access_type: string;
  benefits: string[];
  button_text: string;
  // Promotion fields
  has_promotion?: boolean;
  original_price?: number;
  discount_percentage?: number;
  promotion_end_date?: string;
  promotion_label?: string;
}

export interface PricingUpdate {
  price?: number;
  currency?: string;
  payment_type?: string;
  access_type?: string;
  benefits?: string[];
  button_text?: string;
  // Promotion fields
  has_promotion?: boolean;
  original_price?: number;
  discount_percentage?: number;
  promotion_end_date?: string;
  promotion_label?: string;
}

export class PricingService {
  static async get(): Promise<PricingInfo | null> {
    console.log('PricingService: Buscando informações de preços');
    const { data, error } = await supabase
      .from('landing_content')
      .select('*')
      .eq('section', 'pricing')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('PricingService: Nenhuma informação de preços encontrada');
        return null;
      }
      console.error('PricingService: Erro ao buscar preços:', error);
      throw error;
    }

    console.log('PricingService: Informações de preços encontradas');
    return data.content as unknown as PricingInfo;
  }

  static async save(pricing: PricingInsert): Promise<PricingInfo> {
    console.log('PricingService: Salvando informações de preços:', pricing);
    
    // Verificar se já existe
    const existing = await this.get();
    
    if (existing) {
      // Atualizar existente
      const { data, error } = await supabase
        .from('landing_content')
        .update({
          content: pricing as any,
          updated_at: new Date().toISOString()
        })
        .eq('section', 'pricing')
        .select()
        .single();

      if (error) {
        console.error('PricingService: Erro ao atualizar preços:', error);
        throw error;
      }

      console.log('PricingService: Preços atualizados com sucesso');
      
      // Notificar mudança via DataSync
      import('@/services/dataSync').then(({ DataSyncService }) => {
        DataSyncService.forceNotification('content_changed', { event: 'UPDATE', new: { pricing } });
      });

      return data.content as unknown as PricingInfo;
    } else {
      // Criar novo
      const { data, error } = await supabase
        .from('landing_content')
        .insert({
          section: 'pricing',
          content: pricing as any
        })
        .select()
        .single();

      if (error) {
        console.error('PricingService: Erro ao criar preços:', error);
        throw error;
      }

      console.log('PricingService: Preços criados com sucesso');
      
      // Notificar mudança via DataSync
      import('@/services/dataSync').then(({ DataSyncService }) => {
        DataSyncService.forceNotification('content_changed', { event: 'INSERT', new: { pricing } });
      });

      return data.content as unknown as PricingInfo;
    }
  }

  static getDefaultPricing(): PricingInsert {
    return {
      price: 63.50,
      currency: 'R$',
      payment_type: 'Assinatura mensal',
      access_type: 'Acesso completo',
      benefits: [
        'Acesso completo a todos os áudios especializados',
        'Atualizações constantes de conteúdo',
        'Garantia de Resultados em menos de 30 Dias',
        'Analytics Avançados e Relatórios Personalizados',
        'Instale novos padrões mentais em apenas 21 dias de escuta',
        'Áudios com frequências cientificamente comprovadas',
        'De mindset limitante para mentalidade abundante'
      ],
      button_text: 'Começar Agora',
      has_promotion: false,
      original_price: 63.50,
      discount_percentage: 0,
      promotion_end_date: '',
      promotion_label: ''
    };
  }
}
