import { useState, useEffect } from "react";
import { UserManagementService, UserWithSubscription, UserStats } from "@/services/supabase/userManagementService";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook para gerenciamento de usuários
 * Responsabilidade: Estado e ações para componentes de usuários
 */
export const useUserManagement = () => {
  const [users, setUsers] = useState<UserWithSubscription[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadUsers = async () => {
    setLoading(true);
    setError(null);

    const { data, error: usersError } = await UserManagementService.getAllUsersWithSubscription();
    
    if (usersError) {
      setError(usersError);
      toast({
        title: "Erro ao carregar usuários",
        description: usersError,
        variant: "destructive",
      });
    } else {
      setUsers(data || []);
    }

    setLoading(false);
  };

  const loadStats = async () => {
    const { data, error: statsError } = await UserManagementService.getUserStats();
    
    if (statsError) {
      toast({
        title: "Erro ao carregar estatísticas",
        description: statsError,
        variant: "destructive",
      });
    } else {
      setStats(data);
    }
  };

  const updateUser = async (userId: string, updates: { display_name?: string; role?: string }) => {
    const { success, error } = await UserManagementService.updateUser(userId, updates);
    
    if (error) {
      toast({
        title: "Erro ao atualizar usuário",
        description: error,
        variant: "destructive",
      });
      throw new Error(error);
    } else {
      toast({
        title: "Usuário atualizado",
        description: "Usuário atualizado com sucesso",
      });
      // Recarregar dados para refletir mudanças
      await loadUsers();
    }
  };

  const deleteUser = async (userId: string) => {
    const { success, error } = await UserManagementService.deleteUser(userId);
    
    if (error) {
      toast({
        title: "Erro ao desativar usuário",
        description: error,
        variant: "destructive",
      });
      throw new Error(error);
    } else {
      toast({
        title: "Usuário desativado",
        description: "Usuário desativado com sucesso",
      });
      // Recarregar dados para refletir mudanças
      await loadUsers();
    }
  };

  const refreshData = async () => {
    await Promise.all([loadUsers(), loadStats()]);
  };

  useEffect(() => {
    refreshData();
  }, []);

  return {
    users,
    stats,
    loading,
    error,
    refreshData,
    loadUsers,
    loadStats,
    updateUser,
    deleteUser,
  };
};