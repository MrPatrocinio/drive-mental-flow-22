import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UserWithSubscription } from "@/services/supabase/userManagementService";

interface UserDeleteDialogProps {
  user: UserWithSubscription | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (userId: string) => Promise<void>;
}

/**
 * Dialog de confirmação para exclusão de usuário
 * Responsabilidade: UI para confirmar exclusão de usuário
 */
export const UserDeleteDialog = ({ user, open, onOpenChange, onConfirm }: UserDeleteDialogProps) => {
  const [loading, setLoading] = React.useState(false);

  const handleConfirm = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await onConfirm(user.user_id);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja desativar o usuário{" "}
            <strong>{user?.display_name || user?.email}</strong>?
            <br />
            <br />
            Esta ação irá:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Desativar a conta do usuário</li>
              <li>Cancelar assinatura ativa (se houver)</li>
              <li>Impedir acesso ao sistema</li>
            </ul>
            <br />
            <strong>Esta ação pode ser revertida alterando a função do usuário.</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? "Processando..." : "Sim, Desativar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};