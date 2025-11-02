import { supabase } from "@/integrations/supabase/client";

/**
 * ResetPasswordService - Serviço de redefinição de senha
 * Responsabilidade: Gerenciar atualização de senha após recuperação (princípio SRP)
 * Suporta múltiplos formatos: hash fragment, query params e PKCE code
 */
export class ResetPasswordService {
  /**
   * Extrai o token de recuperação da URL (hash fragment ou query params)
   * Suporta:
   * - #access_token=...&type=recovery (hash fragment - padrão)
   * - ?access_token=...&type=recovery (query params - alguns clientes reescrevem)
   * - ?code=... (PKCE flow - requer exchangeCodeForSession)
   * 
   * @returns { token, type, code } ou null se não encontrado
   */
  static extractRecoveryToken(): { 
    token: string | null; 
    type: 'access_token' | 'code' | null;
    code: string | null;
  } {
    try {
      // 1. Tenta extrair do hash fragment primeiro (padrão Supabase)
      const hash = window.location.hash;
      if (hash) {
        const hashParams = new URLSearchParams(hash.substring(1));
        const token = hashParams.get('access_token');
        const type = hashParams.get('type');

        if (token && type === 'recovery') {
          return { token, type: 'access_token', code: null };
        }
      }

      // 2. Tenta extrair dos query params (alguns navegadores/provedores reescrevem)
      const searchParams = new URLSearchParams(window.location.search);
      
      // 2a. Verifica se há access_token nos query params
      const queryToken = searchParams.get('access_token');
      const queryType = searchParams.get('type');
      
      if (queryToken && queryType === 'recovery') {
        return { token: queryToken, type: 'access_token', code: null };
      }

      // 2b. Verifica se há code (PKCE flow)
      const code = searchParams.get('code');
      if (code) {
        return { token: null, type: 'code', code };
      }

      return { token: null, type: null, code: null };
    } catch (error) {
      console.error('[RESET] Error extracting recovery token:', error);
      return { token: null, type: null, code: null };
    }
  }

  /**
   * Troca o code PKCE por uma sessão válida
   * Necessário quando o link de recuperação usa o fluxo PKCE
   * 
   * @param code - Code PKCE da URL
   * @returns Objeto com erro (null se sucesso)
   */
  static async exchangeCodeForSession(code: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('[RESET] Error exchanging code for session:', error);
        
        if (error.message.includes('expired')) {
          return { error: "O link de recuperação expirou. Solicite um novo." };
        }
        if (error.message.includes('invalid')) {
          return { error: "Link de recuperação inválido. Solicite um novo." };
        }
        
        return { error: "Erro ao validar link de recuperação. Tente novamente." };
      }

      console.log('[RESET] Code exchanged successfully');
      return { error: null };
    } catch (error) {
      console.error('[RESET] Unexpected error exchanging code:', error);
      return { error: "Erro interno no sistema. Tente novamente mais tarde." };
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
