import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserWithSubscription } from "@/services/supabase/userManagementService";

interface UserEditModalProps {
  user: UserWithSubscription | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (userId: string, updates: { display_name?: string; role?: string }) => Promise<void>;
}

/**
 * Modal para edição de usuário
 * Responsabilidade: UI para editar dados básicos do usuário
 */
export const UserEditModal = ({ user, open, onOpenChange, onSave }: UserEditModalProps) => {
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (user) {
      setDisplayName(user.display_name || "");
      setRole(user.role);
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const updates: { display_name?: string; role?: string } = {};
      
      if (displayName !== user.display_name) {
        updates.display_name = displayName;
      }
      
      if (role !== user.role) {
        updates.role = role;
      }

      if (Object.keys(updates).length > 0) {
        await onSave(user.user_id, updates);
      }
      
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setDisplayName(user.display_name || "");
      setRole(user.role);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogDescription>
            Edite as informações básicas do usuário.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display_name">Nome de Exibição</Label>
            <Input
              id="display_name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Nome do usuário"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Função</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma função" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Usuário</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {user && (
            <div className="text-sm text-muted-foreground">
              <p><strong>Email:</strong> {user.email || "Não informado"}</p>
              <p><strong>ID:</strong> {user.user_id}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};