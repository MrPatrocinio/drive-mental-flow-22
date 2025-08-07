/**
 * Field Order Service - Serviço de gerenciamento de ordem de campos
 * Responsabilidade: Lógica de negócio para ordenação de campos
 * Princípio SRP: Apenas lógica de ordenação
 * Princípio DRY: Centralizou lógica reutilizável
 * Princípio SSOT: Fonte única para lógica de ordenação
 */

import { Field, FieldService } from '@/services/supabase/fieldService';

export class FieldOrderService {
  /**
   * Atualiza a ordem dos campos de forma otimizada
   * @param fields - Array de campos na nova ordem
   */
  static async updateFieldsOrder(fields: Field[]): Promise<void> {
    // Preparar updates apenas dos campos que mudaram de posição
    const fieldOrders = fields.map((field, index) => ({
      id: field.id,
      display_order: index + 1
    }));

    // Usar método otimizado do FieldService
    await FieldService.updateOrder(fieldOrders);
  }

  /**
   * Reorganiza campos após deleção para evitar gaps
   * @param deletedFieldOrder - Ordem do campo deletado
   * @param allFields - Todos os campos restantes
   */
  static async reorganizeAfterDeletion(deletedFieldOrder: number, allFields: Field[]): Promise<void> {
    // Filtrar campos que precisam ser atualizados (ordem > campo deletado)
    const fieldsToUpdate = allFields
      .filter(field => field.display_order > deletedFieldOrder)
      .map((field, index) => ({
        id: field.id,
        display_order: deletedFieldOrder + index
      }));

    if (fieldsToUpdate.length > 0) {
      await FieldService.updateOrder(fieldsToUpdate);
    }
  }

  /**
   * Valida se as ordens estão consistentes (sem gaps ou duplicatas)
   * @param fields - Array de campos para validar
   * @returns true se válido, false caso contrário
   */
  static validateOrder(fields: Field[]): boolean {
    const orders = fields.map(f => f.display_order).sort((a, b) => a - b);
    
    // Verificar se há gaps ou duplicatas
    for (let i = 0; i < orders.length; i++) {
      if (orders[i] !== i + 1) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Corrige ordens inconsistentes reorganizando todos os campos
   * @param fields - Array de campos para corrigir
   */
  static async fixInconsistentOrder(fields: Field[]): Promise<void> {
    console.log('FieldOrderService: Corrigindo ordem inconsistente');
    
    // Ordenar por display_order atual e recriar sequência
    const sortedFields = [...fields].sort((a, b) => a.display_order - b.display_order);
    
    const correctedOrders = sortedFields.map((field, index) => ({
      id: field.id,
      display_order: index + 1
    }));

    await FieldService.updateOrder(correctedOrders);
  }
}