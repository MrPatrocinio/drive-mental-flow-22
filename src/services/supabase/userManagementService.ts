import { supabase } from "@/integrations/supabase/client";

export interface UserWithSubscription {
  id: string;
  user_id: string;
  display_name: string | null;
  role: string;
  created_at: string;
  subscribed: boolean | null;
  subscription_tier: string | null;
  subscription_end: string | null;
  stripe_customer_id: string | null;
}

export interface UserStats {
  totalUsers: number;
  totalSubscribers: number;
  recentSignups: number;
  activeSubscriptions: number;
}

/**
 * Serviço para gerenciamento de usuários
 * Responsabilidade: CRUD e consultas de usuários com dados de assinatura
 */
export class UserManagementService {
  
  /**
   * Busca todos os usuários com dados de assinatura
   */
  static async getAllUsersWithSubscription(): Promise<{ data: UserWithSubscription[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          display_name,
          role,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: error.message };
      }

      // Buscar dados de assinatura separadamente
      const { data: subscribersData } = await supabase
        .from('subscribers')
        .select('user_id, subscribed, subscription_tier, subscription_end, stripe_customer_id');

      // Combinar dados
      const transformedData: UserWithSubscription[] = data?.map(user => {
        const subscription = subscribersData?.find(sub => sub.user_id === user.user_id);
        return {
          id: user.id,
          user_id: user.user_id,
          display_name: user.display_name,
          role: user.role,
          created_at: user.created_at,
          subscribed: subscription?.subscribed || null,
          subscription_tier: subscription?.subscription_tier || null,
          subscription_end: subscription?.subscription_end || null,
          stripe_customer_id: subscription?.stripe_customer_id || null,
        };
      }) || [];

      return { data: transformedData, error: null };
    } catch (error) {
      return { data: null, error: "Erro interno ao buscar usuários" };
    }
  }

  /**
   * Busca estatísticas dos usuários
   */
  static async getUserStats(): Promise<{ data: UserStats | null; error: string | null }> {
    try {
      // Total de usuários
      const { count: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (usersError) {
        return { data: null, error: usersError.message };
      }

      // Total de assinantes
      const { count: totalSubscribers, error: subscribersError } = await supabase
        .from('subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('subscribed', true);

      if (subscribersError) {
        return { data: null, error: subscribersError.message };
      }

      // Cadastros recentes (últimos 7 dias)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: recentSignups, error: recentError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      if (recentError) {
        return { data: null, error: recentError.message };
      }

      // Assinaturas ativas (não expiradas)
      const { count: activeSubscriptions, error: activeError } = await supabase
        .from('subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('subscribed', true)
        .or('subscription_end.is.null,subscription_end.gt.' + new Date().toISOString());

      if (activeError) {
        return { data: null, error: activeError.message };
      }

      const stats: UserStats = {
        totalUsers: totalUsers || 0,
        totalSubscribers: totalSubscribers || 0,
        recentSignups: recentSignups || 0,
        activeSubscriptions: activeSubscriptions || 0,
      };

      return { data: stats, error: null };
    } catch (error) {
      return { data: null, error: "Erro interno ao buscar estatísticas" };
    }
  }

  /**
   * Busca usuário por ID
   */
  static async getUserById(userId: string): Promise<{ data: UserWithSubscription | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          display_name,
          role,
          created_at
        `)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        return { data: null, error: error.message };
      }

      if (!data) {
        return { data: null, error: "Usuário não encontrado" };
      }

      // Buscar dados de assinatura
      const { data: subscriptionData } = await supabase
        .from('subscribers')
        .select('subscribed, subscription_tier, subscription_end, stripe_customer_id')
        .eq('user_id', userId)
        .maybeSingle();

      const transformedData: UserWithSubscription = {
        id: data.id,
        user_id: data.user_id,
        display_name: data.display_name,
        role: data.role,
        created_at: data.created_at,
        subscribed: subscriptionData?.subscribed || null,
        subscription_tier: subscriptionData?.subscription_tier || null,
        subscription_end: subscriptionData?.subscription_end || null,
        stripe_customer_id: subscriptionData?.stripe_customer_id || null,
      };

      return { data: transformedData, error: null };
    } catch (error) {
      return { data: null, error: "Erro interno ao buscar usuário" };
    }
  }
}