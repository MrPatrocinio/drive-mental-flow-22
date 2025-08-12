
/**
 * Serviço responsável pela validação de dados de pagamento
 * Princípio SRP: Uma única responsabilidade - validar dados de pagamento
 */
export class StripeValidationService {
  /**
   * Valida se um número de cartão parece ser real (algorítmo básico)
   */
  static isRealCardNumber(cardNumber: string): boolean {
    // Remove espaços e caracteres especiais
    const cleanNumber = cardNumber.replace(/\D/g, '');
    
    // Cartões de teste conhecidos do Stripe
    const testCards = [
      '4242424242424242',
      '4000000000000002', 
      '4000000000009995',
      '5555555555554444',
      '2223003122003222',
      '5200828282828210',
      '4000000000000069'
    ];
    
    return !testCards.includes(cleanNumber);
  }

  /**
   * Valida formato básico do email
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida se todos os campos obrigatórios estão preenchidos
   */
  static validatePaymentForm(formData: { email: string; name: string }): string[] {
    const errors: string[] = [];
    
    if (!formData.email?.trim()) {
      errors.push('Email é obrigatório');
    } else if (!this.isValidEmail(formData.email)) {
      errors.push('Email deve ter um formato válido');
    }
    
    if (!formData.name?.trim()) {
      errors.push('Nome completo é obrigatório');
    } else if (formData.name.trim().length < 2) {
      errors.push('Nome deve ter pelo menos 2 caracteres');
    }
    
    return errors;
  }

  /**
   * Gera uma mensagem de erro amigável baseada no erro do Stripe
   */
  static getPaymentErrorMessage(error: any): string {
    const errorMessage = error?.message || '';
    const errorCode = error?.code || '';
    
    // Mapeamento de erros comuns do Stripe
    const errorMapping: Record<string, string> = {
      'card_declined': 'Seu cartão foi recusado. Tente outro cartão ou entre em contato com seu banco.',
      'insufficient_funds': 'Cartão sem fundos suficientes. Tente outro cartão.',
      'invalid_cvc': 'Código de segurança (CVC) inválido.',
      'invalid_expiry': 'Data de validade do cartão inválida.',
      'card_number_incorrect': 'Número do cartão incorreto.',
      'expired_card': 'Cartão expirado. Use um cartão válido.',
      'processing_error': 'Erro no processamento. Tente novamente em alguns minutos.',
      'rate_limit': 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.'
    };
    
    // Verifica se é um erro de cartão real em modo teste
    if (errorMessage.includes('declined') && errorMessage.includes('test')) {
      return 'Você está usando um cartão real em modo de teste. Use os cartões de teste fornecidos pelo Stripe.';
    }
    
    return errorMapping[errorCode] || errorMapping[errorMessage.toLowerCase()] || 'Erro no pagamento. Tente novamente.';
  }
}
