import { supabase } from "@/integrations/supabase/client";

type ExtractResult = {
  accessToken: string | null;
  refreshToken: string | null;
  code: string | null;
};

/**
 * ResetPasswordService - Serviço de redefinição de senha
 * Responsabilidade: Gerenciar atualização de senha após recuperação (princípio SRP)
 * Suporta múltiplos formatos: hash fragment, query params e PKCE code
 */
export class ResetPasswordService {
  /** Parseia "#a=b&c=d" OU "?a=b&c=d" para URLSearchParams */
  private static toParams(str: string): URLSearchParams {
    if (!str) return new URLSearchParams();
    const s = str.startsWith("#") || str.startsWith("?") ? str.slice(1) : str;
    return new URLSearchParams(s);
  }

  /**
   * Extrai o token de recuperação da URL (hash fragment ou query params)
   * Suporta:
   * - #access_token=...&refresh_token=... (hash fragment - formato antigo)
   * - ?access_token=...&refresh_token=... (query params - alguns clientes reescrevem)
   * - ?code=... (PKCE flow - padrão moderno)
   * 
   * @returns { accessToken, refreshToken, code }
   */
  static extractRecoveryToken(): ExtractResult {
    const url = new URL(window.location.href);
    
    // LOGS DE DEBUG
    console.log('[EXTRACT] Full href:', url.href);
    console.log('[EXTRACT] Search params:', url.search);
    console.log('[EXTRACT] Hash:', url.hash);

    // 1) Hash fragment (fluxo antigo): #access_token=...&refresh_token=...
    const hashParams = this.toParams(url.hash);
    const hashAccess = hashParams.get("access_token");
    const hashRefresh = hashParams.get("refresh_token");
    if (hashAccess && hashRefresh) {
      return { accessToken: hashAccess, refreshToken: hashRefresh, code: null };
    }

    // 2) Query params (alguns provedores colocam tokens na query)
    const q = url.searchParams;
    const qAccess = q.get("access_token");
    const qRefresh = q.get("refresh_token");
    if (qAccess && qRefresh) {
      return { accessToken: qAccess, refreshToken: qRefresh, code: null };
    }

    // 3) PKCE code moderno: ?code=...
    const code = q.get("code");
    if (code) {
      return { accessToken: null, refreshToken: null, code };
    }

    return { accessToken: null, refreshToken: null, code: null };
  }

  /**
   * Estabelece sessão a partir de access_token + refresh_token (fluxo antigo)
   * 
   * @param accessToken - Token de acesso
   * @param refreshToken - Token de refresh
   * @returns Objeto com erro (null se sucesso)
   */
  static async setSessionFromTokens(
    accessToken: string,
    refreshToken: string
  ): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        console.error('[RESET] Error setting session from tokens:', error);
        return { error: error.message };
      }

      console.log('[RESET] Session established from tokens');
      return { error: null };
    } catch (error) {
      console.error('[RESET] Unexpected error setting session:', error);
      return { error: "Falha ao estabelecer sessão via tokens." };
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
   * Remove tokens/code da URL sem recarregar (higiene/privacidade)
   * Evita reprocessamento ao dar refresh na página
   */
  private static stripUrl(): void {
    const clean = window.location.pathname; // mantém apenas o path (/reset-password)
    window.history.replaceState({}, document.title, clean);
  }

  /**
   * Orquestra todas as estratégias de estabelecimento de sessão
   * Tenta em ordem: access_token+refresh_token, PKCE code, fallback para sessão já processada
   * 
   * @returns { success, error } - Indica se conseguiu estabelecer sessão
   */
  static async establishSessionFromUrl(): Promise<{ success: boolean; error?: string }> {
    const { accessToken, refreshToken, code } = this.extractRecoveryToken();
    
    // LOG DE DEBUG
    console.log('[ESTABLISH] Extracted tokens/code:', { 
      hasAccessToken: !!accessToken, 
      hasRefreshToken: !!refreshToken, 
      hasCode: !!code 
    });

    // 1) access_token + refresh_token (hash ou query)
    if (accessToken && refreshToken) {
      const { error } = await this.setSessionFromTokens(accessToken, refreshToken);
      this.stripUrl();
      if (!error) return { success: true };
    }

    // 2) PKCE code
    if (code) {
      const { error } = await this.exchangeCodeForSession(code);
      this.stripUrl();
      if (!error) return { success: true };
    }

    // 3) Fallback — dar tempo para o detectSessionInUrl processar
    await new Promise((r) => setTimeout(r, 300));
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      this.stripUrl();
      return { success: true };
    }

    // 4) Uma segunda verificação rápida (intermitências)
    await new Promise((r) => setTimeout(r, 400));
    const again = await supabase.auth.getSession();
    if (again.data.session?.user) {
      this.stripUrl();
      return { success: true };
    }

    return { success: false, error: "Link de recuperação inválido ou expirado." };
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
