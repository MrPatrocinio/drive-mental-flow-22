
/**
 * Serviço responsável por gerenciar informações sobre o ambiente Stripe
 * Princípio SRP: Uma única responsabilidade - detectar e gerenciar ambiente Stripe
 */
export class StripeEnvironmentService {
  /**
   * Detecta se estamos em modo de teste baseado na presença de dados de teste
   */
  static isTestMode(): boolean {
    // No frontend, assumimos teste por padrão para segurança
    // O backend validará as chaves reais
    return true;
  }

  /**
   * Retorna informações sobre o ambiente atual
   */
  static getEnvironmentInfo() {
    const isTest = this.isTestMode();
    
    return {
      isTestMode: isTest,
      environmentName: isTest ? 'Desenvolvimento (Teste)' : 'Produção',
      description: isTest 
        ? 'Use apenas cartões de teste fornecidos pelo Stripe'
        : 'Ambiente de produção - cartões reais serão cobrados'
    };
  }

  /**
   * Retorna cartões de teste válidos do Stripe
   */
  static getTestCards() {
    return [
      {
        number: '4242424242424242',
        description: 'Visa - Aprovado',
        cvc: 'Qualquer 3 dígitos',
        expiry: 'Qualquer data futura'
      },
      {
        number: '4000000000000002',
        description: 'Visa - Recusado (cartão genérico)',
        cvc: 'Qualquer 3 dígitos',
        expiry: 'Qualquer data futura'
      },
      {
        number: '4000000000009995',
        description: 'Visa - Recusado (fundos insuficientes)',
        cvc: 'Qualquer 3 dígitos',
        expiry: 'Qualquer data futura'
      },
      {
        number: '5555555555554444',
        description: 'Mastercard - Aprovado',
        cvc: 'Qualquer 3 dígitos',
        expiry: 'Qualquer data futura'
      }
    ];
  }
}
