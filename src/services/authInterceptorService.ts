import { supabase } from "@/integrations/supabase/client";

/**
 * AuthInterceptorService - Interceptor para erros de autenticação
 * Responsabilidade: Capturar "bad_jwt" e limpar sessão (princípio SRP)
 * Evita loops infinitos quando token está corrompido
 */
export class AuthInterceptorService {
  /**
   * Wrapper seguro para queries do Supabase
   * Captura erros "bad_jwt: missing sub claim" e força logout
   * 
   * @param fn - Função que retorna Promise (query do Supabase)
   * @returns Resultado da query ou propaga erro
   */
  static async safeQuery<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      const msg = String(error?.message ?? '');
      
      // Detecta "bad_jwt" ou "missing sub claim"
      if (msg.includes('bad_jwt') || msg.includes('missing sub')) {
        console.error('[AUTH INTERCEPTOR] bad_jwt detected. Clearing session and redirecting.');
        
        // 1. Fazer logout no Supabase
        await supabase.auth.signOut();
        
        // 2. Limpar localStorage agressivamente
        try {
          const keys = Object.keys(localStorage);
          keys.forEach(k => {
            if (k.startsWith('sb-') || k.includes('auth') || k.includes('supabase')) {
              localStorage.removeItem(k);
            }
          });
        } catch (e) {
          console.warn('[AUTH INTERCEPTOR] Could not clear localStorage', e);
        }
        
        // 3. Redirecionar para login
        window.location.href = '/login';
      }
      
      // Propagar erro original
      throw error;
    }
  }
}
