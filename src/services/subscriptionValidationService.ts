
/**
 * Subscription Validation Service
 * Responsabilidade: Validação de dados de planos de assinatura
 * Princípio SRP: Apenas validações relacionadas a assinatura
 * Princípio DRY: Centraliza todas as validações de planos
 */

import { SubscriptionPlan, SubscriptionPlansInsert } from './supabase/subscriptionPlansService';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class SubscriptionValidationService {
  /**
   * Valida dados completos dos planos de assinatura
   */
  static validatePlansData(data: SubscriptionPlansInsert): ValidationResult {
    const errors: string[] = [];

    // Validar planos individuais
    data.plans.forEach((plan, index) => {
      const planErrors = this.validateSinglePlan(plan, index + 1);
      errors.push(...planErrors);
    });

    // Validar dados globais
    const globalErrors = this.validateGlobalData(data);
    errors.push(...globalErrors);

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida um plano individual
   */
  private static validateSinglePlan(plan: SubscriptionPlan, planNumber: number): string[] {
    const errors: string[] = [];

    // Validações básicas
    if (!plan.name?.trim()) {
      errors.push(`Nome do plano ${planNumber} é obrigatório`);
    }

    if (!plan.price || plan.price <= 0) {
      errors.push(`Preço do plano ${plan.name || planNumber} deve ser maior que zero`);
    }

    if (!plan.currency?.trim()) {
      errors.push(`Moeda do plano ${plan.name || planNumber} é obrigatória`);
    }

    // Validações de promoção
    if (plan.has_promotion) {
      const promotionErrors = this.validatePromotionData(plan, planNumber);
      errors.push(...promotionErrors);
    }

    return errors;
  }

  /**
   * Valida dados de promoção de um plano
   */
  private static validatePromotionData(plan: SubscriptionPlan, planNumber: number): string[] {
    const errors: string[] = [];

    if (!plan.discount_percentage || plan.discount_percentage <= 0 || plan.discount_percentage > 100) {
      errors.push(`Desconto do plano ${plan.name || planNumber} deve ser entre 1% e 100%`);
    }

    if (!plan.promotion_end_date) {
      errors.push(`Data de fim da promoção do plano ${plan.name || planNumber} é obrigatória`);
    } else {
      const endDate = new Date(plan.promotion_end_date);
      if (endDate <= new Date()) {
        errors.push(`Data de fim da promoção do plano ${plan.name || planNumber} deve ser no futuro`);
      }
    }

    if (!plan.original_price || plan.original_price <= 0) {
      errors.push(`Preço original do plano ${plan.name || planNumber} deve ser maior que zero`);
    }

    if (plan.original_price && plan.price && plan.price >= plan.original_price) {
      errors.push(`Preço promocional do plano ${plan.name || planNumber} deve ser menor que o preço original`);
    }

    return errors;
  }

  /**
   * Valida dados globais dos planos
   */
  private static validateGlobalData(data: SubscriptionPlansInsert): string[] {
    const errors: string[] = [];

    if (!data.button_text?.trim()) {
      errors.push('Texto do botão é obrigatório');
    }

    const validBenefits = data.global_benefits.filter(benefit => benefit.trim() !== '');
    if (validBenefits.length === 0) {
      errors.push('Pelo menos um benefício é obrigatório');
    }

    return errors;
  }

  /**
   * Valida consistência entre planos
   */
  static validatePlansConsistency(plans: SubscriptionPlan[]): string[] {
    const errors: string[] = [];

    // Verificar se há IDs duplicados
    const ids = plans.map(plan => plan.id);
    const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      errors.push(`IDs de planos duplicados encontrados: ${duplicateIds.join(', ')}`);
    }

    // Verificar se há mais de um plano popular
    const popularPlans = plans.filter(plan => plan.popular);
    if (popularPlans.length > 1) {
      errors.push('Apenas um plano pode ser marcado como popular');
    }

    // Verificar se há pelo menos um plano ativo
    const activePlans = plans.filter(plan => plan.is_active !== false);
    if (activePlans.length === 0) {
      errors.push('Pelo menos um plano deve estar ativo');
    }

    // VALIDAÇÕES ESPECÍFICAS PARA 2 PLANOS ANUAIS
    const activePlansFiltered = plans.filter(plan => plan.is_active !== false);
    
    // Verificar número exato de planos ativos
    if (activePlansFiltered.length !== 2) {
      errors.push(`Exatamente 2 planos devem estar ativos. Atualmente há ${activePlansFiltered.length} planos ativos`);
    }

    // Verificar se todos os planos ativos são anuais
    const nonAnnualPlans = activePlansFiltered.filter(
      plan => plan.interval !== 'year' || plan.interval_count !== 1
    );
    if (nonAnnualPlans.length > 0) {
      errors.push('Todos os planos ativos devem ser anuais (interval: year, interval_count: 1)');
    }

    // Verificar se há exatamente um plano com promoção
    const promotionalPlans = activePlansFiltered.filter(plan => plan.has_promotion);
    if (promotionalPlans.length === 0) {
      errors.push('Um dos planos deve ter promoção ativada (has_promotion: true)');
    } else if (promotionalPlans.length > 1) {
      errors.push('Apenas um plano pode ter promoção ativada');
    }

    // Verificar se o plano promocional tem preço menor
    if (promotionalPlans.length === 1 && activePlansFiltered.length === 2) {
      const normalPlan = activePlansFiltered.find(plan => !plan.has_promotion);
      const promoPlan = promotionalPlans[0];
      
      if (normalPlan && promoPlan && promoPlan.price >= normalPlan.price) {
        errors.push(`O plano promocional (${promoPlan.name}) deve ter preço menor que o plano normal (${normalPlan.name})`);
      }
    }

    return errors;
  }
}
