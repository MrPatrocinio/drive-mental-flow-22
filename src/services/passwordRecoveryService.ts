import { supabase } from "@/integrations/supabase/client";

/**
 * PasswordRecoveryService - Serviço de recuperação de senha
 * Responsabilidade: Gerenciar fluxo de recuperação de senha (princípio SRP)
 * Princípio KISS: Usa API nativa do Supabase para máxima simplicidade e segurança
 */
export class PasswordRecoveryService {
  /**
   * Envia email de recuperação de senha
   * Usa API nativa do Supabase para máxima segurança
   * Tokens são gerenciados automaticamente pelo Supabase (criptografados e com expiração)
   * 
   * @param email - Email do usuário
   * @returns Objeto com erro (null se sucesso)
   */
  static async sendPasswordResetEmail(email: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`
      });

      if (error) {
        console.error('[RECOVERY] Error sending reset email:', error);
        return { error: "Erro ao enviar email de recuperação. Tente novamente." };
      }

      // Sempre retorna sucesso por segurança (não expõe se email existe)
      return { error: null };
    } catch (error) {
      console.error('[RECOVERY] Unexpected error:', error);
      return { error: "Erro interno no sistema. Tente novamente mais tarde." };
    }
  }
}
