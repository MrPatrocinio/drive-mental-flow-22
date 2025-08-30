import { supabase } from "@/integrations/supabase/client";

export interface FeedbackEntry {
  id: string;
  userId: string;
  type: 'nps' | 'feature_request' | 'bug_report' | 'general';
  score?: number; // Para NPS: 0-10
  category?: string;
  message: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
  userEmail?: string;
  userName?: string;
}

export interface NPSMetrics {
  averageScore: number;
  totalResponses: number;
  promoters: number; // 9-10
  passives: number;  // 7-8
  detractors: number; // 0-6
  npsScore: number; // % promoters - % detractors
  trend: 'improving' | 'stable' | 'declining';
}

export interface FeedbackStats {
  totalFeedbacks: number;
  pendingReviews: number;
  resolvedIssues: number;
  averageResolutionTime: number; // em dias
  categoryCounts: Array<{ category: string; count: number }>;
}

/**
 * Serviço responsável pelo sistema de feedback e NPS
 * Responsabilidade: Coleta e análise de feedback dos usuários
 */
export class FeedbackService {
  
  /**
   * Coleta feedback/NPS de usuário
   */
  static async submitFeedback(feedback: Omit<FeedbackEntry, 'id' | 'createdAt' | 'status'>): Promise<{ success: boolean; error: string | null }> {
    try {
      // Em produção, salvaria na tabela 'feedback'
      const newFeedback: FeedbackEntry = {
        ...feedback,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        status: 'pending',
      };

      console.log('Novo feedback coletado:', newFeedback);
      
      // Simular salvamento no banco
      // await supabase.from('feedback').insert(newFeedback);
      
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Lista todos os feedbacks para revisão admin
   */
  static async getAllFeedbacks(): Promise<{ data: FeedbackEntry[] | null; error: string | null }> {
    try {
      // Simular dados de feedback (em produção, viria do banco)
      const feedbacks: FeedbackEntry[] = [
        {
          id: '1',
          userId: 'user-1',
          type: 'nps',
          score: 9,
          message: 'Excelente plataforma! Os áudios de relaxamento me ajudaram muito.',
          status: 'reviewed',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          userEmail: 'usuario1@exemplo.com',
          userName: 'Ana Silva',
        },
        {
          id: '2',
          userId: 'user-2',
          type: 'feature_request',
          category: 'Funcionalidade',
          message: 'Seria incrível ter playlists personalizadas e modo offline.',
          status: 'pending',
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          userEmail: 'usuario2@exemplo.com',
          userName: 'Carlos Santos',
        },
        {
          id: '3',
          userId: 'user-3',
          type: 'bug_report',
          category: 'Técnico',
          message: 'O áudio às vezes trava no meio da reprodução no Chrome.',
          status: 'pending',
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          userEmail: 'usuario3@exemplo.com',
          userName: 'Maria Oliveira',
        },
        {
          id: '4',
          userId: 'user-4',
          type: 'nps',
          score: 7,
          message: 'Boa plataforma, mas poderia ter mais variedade de áudios.',
          status: 'reviewed',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          userEmail: 'usuario4@exemplo.com',
          userName: 'João Ferreira',
        },
        {
          id: '5',
          userId: 'user-5',
          type: 'nps',
          score: 3,
          message: 'Interface confusa e preço alto para o que oferece.',
          status: 'pending',
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          userEmail: 'usuario5@exemplo.com',
          userName: 'Laura Costa',
        },
      ];

      return { data: feedbacks, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Calcula métricas NPS
   */
  static async getNPSMetrics(): Promise<{ data: NPSMetrics | null; error: string | null }> {
    try {
      const { data: feedbacks } = await this.getAllFeedbacks();
      
      if (!feedbacks) {
        return { data: null, error: "Erro ao carregar feedbacks" };
      }

      const npsResponses = feedbacks.filter(f => f.type === 'nps' && f.score !== undefined);
      
      if (npsResponses.length === 0) {
        return { 
          data: {
            averageScore: 0,
            totalResponses: 0,
            promoters: 0,
            passives: 0,
            detractors: 0,
            npsScore: 0,
            trend: 'stable',
          }, 
          error: null 
        };
      }

      const scores = npsResponses.map(f => f.score!);
      const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      
      const promoters = scores.filter(s => s >= 9).length;
      const passives = scores.filter(s => s >= 7 && s <= 8).length;
      const detractors = scores.filter(s => s <= 6).length;
      
      const promoterPercentage = (promoters / npsResponses.length) * 100;
      const detractorPercentage = (detractors / npsResponses.length) * 100;
      const npsScore = promoterPercentage - detractorPercentage;
      
      // Simular tendência (em produção, compararia com período anterior)
      let trend: 'improving' | 'stable' | 'declining' = 'stable';
      if (npsScore > 20) trend = 'improving';
      else if (npsScore < -10) trend = 'declining';

      const metrics: NPSMetrics = {
        averageScore: Math.round(averageScore * 100) / 100,
        totalResponses: npsResponses.length,
        promoters,
        passives,
        detractors,
        npsScore: Math.round(npsScore * 100) / 100,
        trend,
      };

      return { data: metrics, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Busca estatísticas gerais de feedback
   */
  static async getFeedbackStats(): Promise<{ data: FeedbackStats | null; error: string | null }> {
    try {
      const { data: feedbacks } = await this.getAllFeedbacks();
      
      if (!feedbacks) {
        return { data: null, error: "Erro ao carregar feedbacks" };
      }

      const totalFeedbacks = feedbacks.length;
      const pendingReviews = feedbacks.filter(f => f.status === 'pending').length;
      const resolvedIssues = feedbacks.filter(f => f.status === 'resolved').length;
      
      // Simular tempo médio de resolução
      const averageResolutionTime = Math.random() * 3 + 1; // 1-4 dias
      
      // Contar por categoria
      const categoryCounts = feedbacks
        .filter(f => f.category)
        .reduce((acc, f) => {
          const category = f.category!;
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

      const categoryArray = Object.entries(categoryCounts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);

      const stats: FeedbackStats = {
        totalFeedbacks,
        pendingReviews,
        resolvedIssues,
        averageResolutionTime: Math.round(averageResolutionTime * 100) / 100,
        categoryCounts: categoryArray,
      };

      return { data: stats, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Atualiza status de feedback
   */
  static async updateFeedbackStatus(feedbackId: string, status: FeedbackEntry['status']): Promise<{ success: boolean; error: string | null }> {
    try {
      // Simular atualização (em produção, atualizaria no banco)
      console.log(`Feedback ${feedbackId} marcado como ${status}`);
      
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Remove feedback
   */
  static async deleteFeedback(feedbackId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      // Simular remoção (em produção, removeria do banco)
      console.log(`Feedback ${feedbackId} removido`);
      
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}