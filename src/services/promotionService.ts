/**
 * Promotion Service
 * Responsabilidade: Lógica de negócio para promoções
 * Princípio SRP: Apenas cálculos e validações de promoção
 * Princípio DRY: Centraliza toda lógica promocional
 */

import { PricingInfo } from '@/services/supabase/pricingService';

export interface PromotionCalculation {
  originalPrice: number;
  discountedPrice: number;
  discountAmount: number;
  isValid: boolean;
  timeRemaining?: number;
}

export class PromotionService {
  /**
   * Calcula preço promocional e validação
   */
  static calculatePromotion(pricing: PricingInfo): PromotionCalculation {
    if (!pricing.has_promotion || !pricing.discount_percentage || !pricing.original_price) {
      return {
        originalPrice: pricing.price,
        discountedPrice: pricing.price,
        discountAmount: 0,
        isValid: false
      };
    }

    const isValid = this.isPromotionValid(pricing.promotion_end_date);
    const originalPrice = pricing.original_price;
    const discountAmount = (originalPrice * pricing.discount_percentage) / 100;
    const discountedPrice = originalPrice - discountAmount;

    return {
      originalPrice,
      discountedPrice: isValid ? discountedPrice : originalPrice,
      discountAmount: isValid ? discountAmount : 0,
      isValid,
      timeRemaining: isValid ? this.getTimeRemaining(pricing.promotion_end_date) : undefined
    };
  }

  /**
   * Verifica se a promoção ainda é válida
   */
  static isPromotionValid(endDate?: string): boolean {
    if (!endDate) return false;
    return new Date(endDate) > new Date();
  }

  /**
   * Calcula tempo restante em milissegundos
   */
  static getTimeRemaining(endDate?: string): number {
    if (!endDate) return 0;
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    return Math.max(0, end - now);
  }

  /**
   * Formata tempo restante para exibição
   */
  static formatTimeRemaining(timeRemaining: number): string {
    const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Valida dados de promoção antes de salvar
   */
  static validatePromotionData(data: {
    has_promotion: boolean;
    discount_percentage?: number;
    promotion_end_date?: string;
    original_price?: number;
  }): string[] {
    const errors: string[] = [];

    if (data.has_promotion) {
      if (!data.discount_percentage || data.discount_percentage <= 0 || data.discount_percentage > 100) {
        errors.push('Desconto deve ser entre 1% e 100%');
      }

      if (!data.promotion_end_date) {
        errors.push('Data de fim da promoção é obrigatória');
      } else if (new Date(data.promotion_end_date) <= new Date()) {
        errors.push('Data de fim deve ser no futuro');
      }

      if (!data.original_price || data.original_price <= 0) {
        errors.push('Preço original deve ser maior que zero');
      }
    }

    return errors;
  }
}