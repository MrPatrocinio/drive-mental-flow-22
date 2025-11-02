import { supabase } from "@/integrations/supabase/client";

/**
 * ResetPasswordService - Serviço de redefinição de senha
 * Responsabilidade: Gerenciar atualização de senha após recuperação (princípio SRP)
 * Princípio KISS: Usa API nativa do Supabase para máxima simplicidade
 */
export class ResetPasswordService {
  /**
   * Extrai o token de recuperação da URL (hash fragment)
   * Supabase adiciona #access_token=...&type=recovery na URL
   * 
   * @returns Token de acesso ou null se não encontrado
   */
  static extractRecoveryToken(): string | null {
    try {
      const hash = window.location.hash;
      
      if (!hash) {
        return null;
      }

      // Remove o # inicial e parseia os parâmetros
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get('access_token');
      const type = params.get('type');

      // Valida se é um token de recuperação válido
      if (token && type === 'recovery') {
        return token;
      }

      return null;
    } catch (error) {
      console.error('[RESET] Error extracting recovery token:', error);
      return null;
    }
  }

  /**
   * Atualiza a senha do usuário
   * Usa API nativa do Supabase que já valida o token automaticamente
   * 
   * @param newPassword - Nova senha do usuário
   * @returns Objeto com erro (null se sucesso)
   */
  static async updatePassword(newPassword: string): Promise<{ error: string | null }> {
    try {
      // Valida senha mínima
      if (!newPassword || newPassword.length < 6) {
        return { error: "A senha deve ter no mínimo 6 caracteres." };
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('[RESET] Error updating password:', error);
        
        // Traduz erros comuns
        if (error.message.includes('expired')) {
          return { error: "O link de recuperação expirou. Solicite um novo." };
        }
        if (error.message.includes('invalid')) {
          return { error: "Link de recuperação inválido. Solicite um novo." };
        }
        
        return { error: "Erro ao atualizar senha. Tente novamente." };
      }

      console.log('[RESET] Password updated successfully');
      return { error: null };
    } catch (error) {
      console.error('[RESET] Unexpected error:', error);
      return { error: "Erro interno no sistema. Tente novamente mais tarde." };
    }
  }
}
