/**
 * Serviço de tradução de mensagens de erro
 * Responsabilidade: Traduzir erros do Supabase de inglês para português
 * Princípio SSOT: Única fonte de verdade para traduções de erro
 */

const AUTH_ERROR_TRANSLATIONS: Record<string, string> = {
  // Erros de cadastro
  'User already registered': 'Este e-mail já está cadastrado. Use a aba Login para entrar.',
  'user already registered': 'Este e-mail já está cadastrado. Use a aba Login para entrar.',
  
  // Erros de login
  'Invalid login credentials': 'E-mail ou senha incorretos',
  'invalid login credentials': 'E-mail ou senha incorretos',
  'Email not confirmed': 'Confirme seu e-mail antes de fazer login',
  'email not confirmed': 'Confirme seu e-mail antes de fazer login',
  
  // Erros de validação
  'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres',
  'password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres',
  'Invalid email': 'E-mail inválido',
  'invalid email': 'E-mail inválido',
  'Unable to validate email address: invalid format': 'E-mail inválido',
  
  // Erros de rede
  'Network request failed': 'Erro de conexão. Verifique sua internet.',
  'network request failed': 'Erro de conexão. Verifique sua internet.',
  
  // Erros genéricos
  'User not found': 'Usuário não encontrado',
  'user not found': 'Usuário não encontrado',
};

/**
 * Traduz mensagem de erro do Supabase para português
 * @param errorMessage - Mensagem de erro em inglês
 * @returns Mensagem traduzida em português
 */
export function translateAuthError(errorMessage: string): string {
  if (!errorMessage) {
    return 'Erro ao processar sua solicitação';
  }

  // Busca tradução exata
  const translation = AUTH_ERROR_TRANSLATIONS[errorMessage];
  if (translation) {
    return translation;
  }

  // Busca por correspondência parcial (case-insensitive)
  const lowerMessage = errorMessage.toLowerCase();
  for (const [key, value] of Object.entries(AUTH_ERROR_TRANSLATIONS)) {
    if (lowerMessage.includes(key.toLowerCase())) {
      return value;
    }
  }

  // Mensagem genérica se não encontrar tradução
  return 'Erro ao processar sua solicitação. Tente novamente.';
}
