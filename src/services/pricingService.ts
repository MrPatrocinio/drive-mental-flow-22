export interface PricingData {
  price: number;
  currency: 'BRL' | 'USD' | 'EUR';
  benefits: string[];
}

export interface PricingValidation {
  isValid: boolean;
  errors: string[];
}

class PricingService {
  private readonly STORAGE_KEY = 'drive_mental_pricing';
  private readonly MIN_PRICE = 0.01;
  private readonly MAX_PRICE = 999999.99;

  getPricingData(): PricingData {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.warn('Failed to parse stored pricing data:', error);
      }
    }
    
    return this.getDefaultPricing();
  }

  savePricingData(data: PricingData): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const validation = this.validatePricing(data);
        if (!validation.isValid) {
          reject(new Error(validation.errors.join(', ')));
          return;
        }

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  validatePricing(data: PricingData): PricingValidation {
    const errors: string[] = [];

    if (data.price < this.MIN_PRICE) {
      errors.push(`Preço deve ser maior que ${this.MIN_PRICE}`);
    }

    if (data.price > this.MAX_PRICE) {
      errors.push(`Preço deve ser menor que ${this.MAX_PRICE}`);
    }

    if (!['BRL', 'USD', 'EUR'].includes(data.currency)) {
      errors.push('Moeda inválida');
    }

    if (data.benefits.length === 0) {
      errors.push('Pelo menos um benefício é obrigatório');
    }

    if (data.benefits.some(benefit => benefit.trim().length === 0)) {
      errors.push('Benefícios não podem estar vazios');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private getDefaultPricing(): PricingData {
    return {
      price: 97,
      currency: 'BRL',
      benefits: [
        'Acesso completo aos áudios especializados',
        'Técnicas de relaxamento profundo',
        'Suporte especializado 24/7',
        'Atualizações constantes de conteúdo'
      ]
    };
  }
}

export const pricingService = new PricingService();