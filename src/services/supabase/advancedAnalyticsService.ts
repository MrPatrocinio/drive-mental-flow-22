import { supabase } from "@/integrations/supabase/client";

export interface ConversionFunnelStep {
  step: string;
  users: number;
  conversionRate: number;
  dropoffRate: number;
}

export interface UserBehaviorMetrics {
  averageSessionDuration: number;
  pagesPerSession: number;
  bounceRate: number;
  returnUserRate: number;
  topExitPages: Array<{ page: string; exits: number }>;
  topEntryPages: Array<{ page: string; entries: number }>;
}

export interface AdvancedMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  conversionRate: number;
  averageRevenuePer: number;
  customerAcquisitionCost: number;
}

/**
 * Serviço responsável por analytics avançados
 * Responsabilidade: Métricas avançadas e análise de comportamento
 */
export class AdvancedAnalyticsService {
  
  /**
   * Calcula o funil de conversão
   */
  static async getConversionFunnel(): Promise<{ data: ConversionFunnelStep[] | null; error: string | null }> {
    try {
      // Buscar dados base de usuários e assinantes
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: subscribers } = await supabase
        .from('subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('subscribed', true);

      // Simular dados do funil (em produção, viriam de eventos de analytics)
      const visitorsBase = totalUsers ? totalUsers * 3.5 : 100; // Simular visitantes
      
      const funnelSteps: ConversionFunnelStep[] = [
        {
          step: 'Visitantes',
          users: Math.floor(visitorsBase),
          conversionRate: 100,
          dropoffRate: 0,
        },
        {
          step: 'Interesse (Demo)',
          users: Math.floor(visitorsBase * 0.25),
          conversionRate: 25,
          dropoffRate: 75,
        },
        {
          step: 'Consideração (Cadastro)',
          users: totalUsers || 0,
          conversionRate: totalUsers ? (totalUsers / visitorsBase) * 100 : 15,
          dropoffRate: totalUsers ? 100 - ((totalUsers / visitorsBase) * 100) : 85,
        },
        {
          step: 'Intenção (Página de Pagamento)',
          users: Math.floor((totalUsers || 0) * 0.4),
          conversionRate: totalUsers ? ((totalUsers * 0.4) / visitorsBase) * 100 : 6,
          dropoffRate: totalUsers ? 100 - (((totalUsers * 0.4) / visitorsBase) * 100) : 94,
        },
        {
          step: 'Conversão (Assinatura)',
          users: subscribers || 0,
          conversionRate: subscribers && visitorsBase ? (subscribers / visitorsBase) * 100 : 3,
          dropoffRate: subscribers && visitorsBase ? 100 - ((subscribers / visitorsBase) * 100) : 97,
        },
      ];

      return { data: funnelSteps, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Busca métricas comportamentais de usuários
   */
  static async getUserBehaviorMetrics(): Promise<{ data: UserBehaviorMetrics | null; error: string | null }> {
    try {
      // Simular dados comportamentais (em produção, viriam do analytics)
      const behaviorMetrics: UserBehaviorMetrics = {
        averageSessionDuration: Math.floor(Math.random() * 300 + 180), // 3-8 minutos
        pagesPerSession: Math.round((Math.random() * 3 + 2) * 100) / 100, // 2-5 páginas
        bounceRate: Math.round((Math.random() * 30 + 35) * 100) / 100, // 35-65%
        returnUserRate: Math.round((Math.random() * 40 + 30) * 100) / 100, // 30-70%
        topExitPages: [
          { page: '/dashboard', exits: Math.floor(Math.random() * 50 + 20) },
          { page: '/campo/:fieldId', exits: Math.floor(Math.random() * 40 + 15) },
          { page: '/assinatura', exits: Math.floor(Math.random() * 30 + 10) },
          { page: '/audio/:audioId', exits: Math.floor(Math.random() * 25 + 8) },
        ],
        topEntryPages: [
          { page: '/', entries: Math.floor(Math.random() * 100 + 50) },
          { page: '/demo', entries: Math.floor(Math.random() * 60 + 30) },
          { page: '/assinatura', entries: Math.floor(Math.random() * 40 + 20) },
          { page: '/dashboard', entries: Math.floor(Math.random() * 30 + 15) },
        ],
      };

      return { data: behaviorMetrics, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Calcula métricas avançadas de negócio
   */
  static async getAdvancedMetrics(): Promise<{ data: AdvancedMetrics | null; error: string | null }> {
    try {
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: subscribers } = await supabase
        .from('subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('subscribed', true);

      // Simular usuários ativos (últimos 30 dias)
      const activeUsers = Math.floor((totalUsers || 0) * 0.7);
      
      // Simular novos usuários (último mês)
      const newUsers = Math.floor((totalUsers || 0) * 0.2);
      
      // Calcular taxa de conversão
      const conversionRate = totalUsers && subscribers ? (subscribers / totalUsers) * 100 : 0;
      
      // Simular CAC (Customer Acquisition Cost)
      const customerAcquisitionCost = Math.random() * 50 + 15; // R$ 15-65
      
      const metrics: AdvancedMetrics = {
        totalUsers: totalUsers || 0,
        activeUsers,
        newUsers,
        conversionRate: Math.round(conversionRate * 100) / 100,
        averageRevenuePer: 29.90, // Valor fixo da assinatura
        customerAcquisitionCost: Math.round(customerAcquisitionCost * 100) / 100,
      };

      return { data: metrics, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Gera relatório de segmentação de usuários
   */
  static async getUserSegmentation(): Promise<{ data: Array<{ segment: string; users: number; percentage: number }> | null; error: string | null }> {
    try {
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: subscribers } = await supabase
        .from('subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('subscribed', true);

      if (!totalUsers) {
        return { data: [], error: null };
      }

      const nonSubscribers = totalUsers - (subscribers || 0);
      
      // Simular segmentação adicional
      const segments = [
        {
          segment: 'Assinantes Ativos',
          users: subscribers || 0,
          percentage: Math.round(((subscribers || 0) / totalUsers) * 100),
        },
        {
          segment: 'Usuários Gratuitos',
          users: nonSubscribers,
          percentage: Math.round((nonSubscribers / totalUsers) * 100),
        },
        {
          segment: 'Usuários Novos (< 30 dias)',
          users: Math.floor((totalUsers || 0) * 0.2),
          percentage: 20,
        },
        {
          segment: 'Usuários Engajados',
          users: Math.floor((totalUsers || 0) * 0.6),
          percentage: 60,
        },
        {
          segment: 'Usuários em Risco',
          users: Math.floor((totalUsers || 0) * 0.15),
          percentage: 15,
        },
      ];

      return { data: segments, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }
}