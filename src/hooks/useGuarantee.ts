import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface GuaranteeStatus {
  id: string;
  user_id: string;
  purchase_id: string;
  start_date: string;
  unconditional_until: string;
  monitoring_until: string;
  retention_until: string;
  status: string;
  decision_reason: string | null;
  decided_at: string | null;
  decided_by: string | null;
  best_len: number;
  computed_state: string;
  created_at: string;
  updated_at: string;
}

export interface GuaranteeDaily {
  id: string;
  enrollment_id: string;
  day: string;
  plays_valid: number;
  meets_20: boolean;
}

export const useGuarantee = () => {
  const [guarantees, setGuarantees] = useState<GuaranteeStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { toast } = useToast();

  const loadGuarantees = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('v_guarantee_status')
        .select('*');
      
      if (filter !== 'all') {
        query = query.eq('computed_state', filter);
      }

      const { data, error } = await query.order('start_date', { ascending: false });
      
      if (error) throw error;
      setGuarantees(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar garantias',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getGuaranteeDaily = async (enrollmentId: string): Promise<GuaranteeDaily[]> => {
    try {
      const { data, error } = await supabase
        .from('guarantee_daily')
        .select('*')
        .eq('enrollment_id', enrollmentId)
        .order('day', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar histórico diário',
        description: error.message,
        variant: 'destructive'
      });
      return [];
    }
  };

  const processRefund = async (enrollmentId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Sessão não encontrada');
      }

      const response = await fetch(
        `https://ipdzkzlrcyrcfwvhiulc.supabase.co/functions/v1/guarantee-refund/${enrollmentId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = await response.json();
      
      if (!result.ok) {
        throw new Error(result.message || 'Erro ao processar reembolso');
      }
      
      toast({
        title: 'Reembolso processado',
        description: 'O reembolso foi enviado ao Stripe e a assinatura foi cancelada.'
      });
      
      await loadGuarantees();
    } catch (error: any) {
      toast({
        title: 'Erro ao processar reembolso',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const denyGuarantee = async (enrollmentId: string, reason: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Sessão não encontrada');
      }

      const response = await fetch(
        `https://ipdzkzlrcyrcfwvhiulc.supabase.co/functions/v1/guarantee-deny/${enrollmentId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ reason })
        }
      );

      const result = await response.json();
      
      if (!result.ok) {
        throw new Error(result.message || 'Erro ao negar garantia');
      }
      
      toast({
        title: 'Garantia negada',
        description: 'O pedido foi negado com sucesso.'
      });
      
      await loadGuarantees();
    } catch (error: any) {
      toast({
        title: 'Erro ao negar garantia',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const markAsReview = async (enrollmentId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Sessão não encontrada');
      }

      const response = await fetch(
        `https://ipdzkzlrcyrcfwvhiulc.supabase.co/functions/v1/guarantee-cancel-request/${enrollmentId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = await response.json();
      
      if (!result.ok) {
        throw new Error(result.message || 'Erro ao marcar para revisão');
      }
      
      toast({
        title: 'Marcado para revisão',
        description: 'O pedido foi marcado como pendente de revisão.'
      });
      
      await loadGuarantees();
    } catch (error: any) {
      toast({
        title: 'Erro ao marcar para revisão',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    loadGuarantees();
  }, [filter]);

  return {
    guarantees,
    loading,
    filter,
    setFilter,
    loadGuarantees,
    getGuaranteeDaily,
    processRefund,
    denyGuarantee,
    markAsReview
  };
};
