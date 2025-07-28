import { supabase } from '@/integrations/supabase/client';

export interface PricingInfo {
  id?: string;
  price: number;
  currency: string;
  payment_type: string;
  access_type: string;
  benefits: string[];
  button_text: string;
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
}

export interface PricingUpdate {
  price?: number;
  currency?: string;
  payment_type?: string;
  access_type?: string;
  benefits?: string[];
  button_text?: string;
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
      price: 97,
      currency: 'R$',
      payment_type: 'Pagamento único',
      access_type: 'Acesso vitalício',
      benefits: [
        'Acesso completo aos áudios especializados',
        'Suporte especializado 24/7',
        'Atualizações constantes de conteúdo'
      ],
      button_text: 'Começar Agora'
    };
  }
}