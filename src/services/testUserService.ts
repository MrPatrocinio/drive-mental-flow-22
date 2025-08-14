
/**
 * TestUserService - Serviço para configurar usuários de teste
 * Responsabilidade: Operações específicas para ambiente de teste
 * Princípios: SRP (uma responsabilidade), KISS (simples e direto)
 */

import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export class TestUserService {
  /**
   * Configura usuário de teste com assinatura premium
   * Princípio SRP: Responsabilidade única - configurar teste
   */
  static async setupTestUser(email: string): Promise<{
    success: boolean;
    error: string | null;
  }> {
    try {
      console.log('[TEST_USER] Configurando usuário de teste:', email);

      // Verificar se o usuário atual é admin (apenas admins podem fazer isso)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          error: 'Usuário não autenticado'
        };
      }

      // Buscar perfil do usuário atual
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        return {
          success: false,
          error: 'Apenas administradores podem configurar usuários de teste'
        };
      }

      // Buscar o usuário de teste pelo email
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('display_name', email)
        .limit(1);

      if (profileError) {
        console.error('[TEST_USER] Erro ao buscar perfil:', profileError);
        return {
          success: false,
          error: 'Erro ao buscar usuário'
        };
      }

      if (!profiles || profiles.length === 0) {
        return {
          success: false,
          error: `Usuário ${email} não encontrado`
        };
      }

      const testUserId = profiles[0].user_id;

      // Configurar assinatura premium para o usuário de teste
      const subscriptionEnd = new Date();
      subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1); // 1 ano

      const { error: upsertError } = await supabase
        .from('subscribers')
        .upsert({
          user_id: testUserId,
          email: email,
          subscribed: true,
          subscription_tier: 'premium',
          subscription_end: subscriptionEnd.toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,email'
        });

      if (upsertError) {
        console.error('[TEST_USER] Erro no upsert:', upsertError);
        return {
          success: false,
          error: 'Erro ao configurar assinatura'
        };
      }

      console.log('[TEST_USER] Usuário configurado com sucesso');
      toast.success(`Usuário ${email} configurado com assinatura premium`);

      return {
        success: true,
        error: null
      };

    } catch (error) {
      console.error('[TEST_USER] Erro geral:', error);
      return {
        success: false,
        error: 'Erro interno na configuração do usuário'
      };
    }
  }
}
