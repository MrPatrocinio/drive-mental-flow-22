import { useState, useEffect } from "react";
import { FeedbackService, FeedbackEntry, NPSMetrics, FeedbackStats } from "@/services/feedbackService";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook para gerenciamento de feedback e NPS
 * Responsabilidade: Estado e ações para componentes de feedback
 */
export const useFeedback = () => {
  const [feedbacks, setFeedbacks] = useState<FeedbackEntry[]>([]);
  const [npsMetrics, setNpsMetrics] = useState<NPSMetrics | null>(null);
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const loadFeedbacks = async () => {
    const { data, error: feedbacksError } = await FeedbackService.getAllFeedbacks();
    
    if (feedbacksError) {
      setError(feedbacksError);
      toast({
        title: "Erro ao carregar feedbacks",
        description: feedbacksError,
        variant: "destructive",
      });
    } else {
      setFeedbacks(data || []);
    }
  };

  const loadNpsMetrics = async () => {
    const { data, error: npsError } = await FeedbackService.getNPSMetrics();
    
    if (npsError) {
      setError(npsError);
      toast({
        title: "Erro ao carregar métricas NPS",
        description: npsError,
        variant: "destructive",
      });
    } else {
      setNpsMetrics(data);
    }
  };

  const loadFeedbackStats = async () => {
    const { data, error: statsError } = await FeedbackService.getFeedbackStats();
    
    if (statsError) {
      setError(statsError);
      toast({
        title: "Erro ao carregar estatísticas",
        description: statsError,
        variant: "destructive",
      });
    } else {
      setFeedbackStats(data);
    }
  };

  const submitFeedback = async (feedback: Omit<FeedbackEntry, 'id' | 'createdAt' | 'status'>) => {
    setSubmitting(true);
    
    try {
      const { success, error: submitError } = await FeedbackService.submitFeedback(feedback);
      
      if (submitError) {
        toast({
          title: "Erro ao enviar feedback",
          description: submitError,
          variant: "destructive",
        });
        return false;
      } else {
        toast({
          title: "Feedback enviado!",
          description: "Obrigado pelo seu feedback. Nossa equipe irá analisá-lo.",
        });
        
        await refreshAllData();
        return true;
      }
    } finally {
      setSubmitting(false);
    }
  };

  const updateFeedbackStatus = async (feedbackId: string, status: FeedbackEntry['status']) => {
    const { success, error: updateError } = await FeedbackService.updateFeedbackStatus(feedbackId, status);
    
    if (updateError) {
      toast({
        title: "Erro ao atualizar status",
        description: updateError,
        variant: "destructive",
      });
      return false;
    } else {
      toast({
        title: "Status atualizado!",
        description: `Feedback marcado como ${status}.`,
      });
      
      // Atualizar estado local
      setFeedbacks(prev => 
        prev.map(feedback => 
          feedback.id === feedbackId 
            ? { ...feedback, status }
            : feedback
        )
      );
      
      await loadFeedbackStats(); // Recarregar estatísticas
      return true;
    }
  };

  const deleteFeedback = async (feedbackId: string) => {
    const { success, error: deleteError } = await FeedbackService.deleteFeedback(feedbackId);
    
    if (deleteError) {
      toast({
        title: "Erro ao remover feedback",
        description: deleteError,
        variant: "destructive",
      });
      return false;
    } else {
      toast({
        title: "Feedback removido!",
        description: "O feedback foi removido com sucesso.",
      });
      
      // Remover do estado local
      setFeedbacks(prev => prev.filter(f => f.id !== feedbackId));
      await Promise.all([loadNpsMetrics(), loadFeedbackStats()]);
      return true;
    }
  };

  const refreshAllData = async () => {
    setLoading(true);
    setError(null);
    
    await Promise.all([
      loadFeedbacks(),
      loadNpsMetrics(),
      loadFeedbackStats(),
    ]);
    
    setLoading(false);
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  return {
    feedbacks,
    npsMetrics,
    feedbackStats,
    loading,
    error,
    submitting,
    refreshAllData,
    submitFeedback,
    updateFeedbackStatus,
    deleteFeedback,
  };
};