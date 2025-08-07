
import { supabase } from '@/integrations/supabase/client';

export interface Field {
  id: string;
  title: string;
  description: string | null;
  icon_name: string;
  audio_count: number;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface FieldInsert {
  title: string;
  description?: string;
  icon_name: string;
  display_order?: number;
}

export interface FieldUpdate {
  title?: string;
  description?: string;
  icon_name?: string;
  display_order?: number;
}

export class FieldService {
  static async getAll(): Promise<Field[]> {
    console.log('FieldService: Buscando todos os campos');
    const { data, error } = await supabase
      .from('fields')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('FieldService: Erro ao buscar campos:', error);
      throw error;
    }

    console.log('FieldService: Campos encontrados:', data?.length || 0);
    return data || [];
  }

  static async getById(id: string): Promise<Field | null> {
    console.log('FieldService: Buscando campo por ID:', id);
    const { data, error } = await supabase
      .from('fields')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('FieldService: Campo não encontrado:', id);
        return null;
      }
      console.error('FieldService: Erro ao buscar campo:', error);
      throw error;
    }

    console.log('FieldService: Campo encontrado:', data.title);
    return data;
  }

  static async create(field: FieldInsert): Promise<Field> {
    console.log('FieldService: Criando campo:', field);
    const { data, error } = await supabase
      .from('fields')
      .insert(field)
      .select()
      .single();

    if (error) {
      console.error('FieldService: Erro ao criar campo:', error);
      throw error;
    }

    console.log('FieldService: Campo criado com sucesso:', data.title);
    
    // Notificar mudança via DataSync
    import('@/services/dataSync').then(({ DataSyncService }) => {
      DataSyncService.forceNotification('fields_changed', { event: 'INSERT', new: data });
    });

    return data;
  }

  static async update(id: string, field: FieldUpdate): Promise<Field> {
    console.log('FieldService: Atualizando campo:', id, field);
    const { data, error } = await supabase
      .from('fields')
      .update(field)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('FieldService: Erro ao atualizar campo:', error);
      throw error;
    }

    console.log('FieldService: Campo atualizado com sucesso:', data.title);
    
    // Notificar mudança via DataSync
    import('@/services/dataSync').then(({ DataSyncService }) => {
      DataSyncService.forceNotification('fields_changed', { event: 'UPDATE', new: data });
    });

    return data;
  }

  static async delete(id: string): Promise<void> {
    console.log('FieldService: Deletando campo:', id);
    const { error } = await supabase
      .from('fields')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('FieldService: Erro ao deletar campo:', error);
      throw error;
    }

    console.log('FieldService: Campo deletado com sucesso');
    
    // Notificar mudança via DataSync
    import('@/services/dataSync').then(({ DataSyncService }) => {
      DataSyncService.forceNotification('fields_changed', { event: 'DELETE', old: { id } });
    });
  }

  static async updateOrder(fieldOrders: { id: string; display_order: number }[]): Promise<void> {
    console.log('FieldService: Atualizando ordem dos campos:', fieldOrders);
    
    // Atualizar em lote usando Promise.all para performance
    const updates = fieldOrders.map(({ id, display_order }) =>
      supabase
        .from('fields')
        .update({ display_order })
        .eq('id', id)
    );

    const results = await Promise.all(updates);
    
    // Verificar se houve erros
    const errors = results.filter(result => result.error).map(result => result.error);
    if (errors.length > 0) {
      console.error('FieldService: Erros ao atualizar ordem:', errors);
      throw new Error(`Erro ao atualizar ordem: ${errors[0]?.message}`);
    }

    console.log('FieldService: Ordem atualizada com sucesso');
    
    // Notificar mudança via DataSync
    import('@/services/dataSync').then(({ DataSyncService }) => {
      DataSyncService.forceNotification('fields_changed', { event: 'ORDER_UPDATE', payload: fieldOrders });
    });
  }
}
