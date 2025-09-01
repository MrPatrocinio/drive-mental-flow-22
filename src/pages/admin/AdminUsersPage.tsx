import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useUserManagement } from "@/hooks/useUserManagement";
import { UserStatsCards } from "@/components/admin/users/UserStatsCards";
import { UserTable } from "@/components/admin/users/UserTable";
import { UserEditModal } from "@/components/admin/users/UserEditModal";
import { UserDeleteDialog } from "@/components/admin/users/UserDeleteDialog";
import { UserWithSubscription } from "@/services/supabase/userManagementService";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { RefreshCw, Search } from "lucide-react";

/**
 * Página de gerenciamento de usuários
 * Responsabilidade: Coordenação da interface de usuários
 */
export const AdminUsersPage = () => {
  const { users, stats, loading, refreshData, updateUser, deleteUser } = useUserManagement();
  const [searchTerm, setSearchTerm] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithSubscription | null>(null);

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

  const handleEditUser = (user: UserWithSubscription) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleDeleteUser = (user: UserWithSubscription) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleSaveUser = async (userId: string, updates: { display_name?: string; role?: string }) => {
    await updateUser(userId, updates);
  };

  const handleConfirmDelete = async (userId: string) => {
    await deleteUser(userId);
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
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
            />
          </CardContent>
        </Card>

        <UserEditModal
          user={selectedUser}
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          onSave={handleSaveUser}
        />

        <UserDeleteDialog
          user={selectedUser}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleConfirmDelete}
        />
      </div>
    </AdminLayout>
  );
};