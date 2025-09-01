import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useUserManagement } from "@/hooks/useUserManagement";
import { UserStatsCards } from "@/components/admin/users/UserStatsCards";
import { UserTable } from "@/components/admin/users/UserTable";
import { UserWithSubscription } from "@/services/supabase/userManagementService";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { RefreshCw, Search } from "lucide-react";

/**
 * Página de gerenciamento de usuários
 * Responsabilidade: Coordenação da interface de usuários
 */
export const AdminUsersPage = () => {
  const { users, stats, loading, refreshData } = useUserManagement();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(user => 
    user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewUser = (user: UserWithSubscription) => {
    // TODO: Implementar modal de detalhes do usuário
    console.log("Ver usuário:", user);
  };

  const handleContactUser = (user: UserWithSubscription) => {
    // TODO: Implementar sistema de comunicação
    console.log("Contatar usuário:", user);
  };

  return (
    <AdminLayout title="Usuários">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
            <p className="text-muted-foreground">
              Gerencie usuários e suas assinaturas
            </p>
          </div>
          <Button onClick={refreshData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>

        <UserStatsCards stats={stats} loading={loading} />

        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuários</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar usuários..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <UserTable
              users={filteredUsers}
              loading={loading}
              onViewUser={handleViewUser}
              onContactUser={handleContactUser}
            />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};