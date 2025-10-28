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
          <AlertDialogTitle>⚠️ Confirmar Exclusão PERMANENTE</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p className="text-destructive font-semibold">
              ATENÇÃO: Esta ação é IRREVERSÍVEL!
            </p>
            <p>
              Tem certeza que deseja <strong>DELETAR PERMANENTEMENTE</strong> o usuário{" "}
              <strong>{user?.display_name || user?.email}</strong>?
            </p>
            <div className="bg-destructive/10 border border-destructive/30 rounded-md p-3">
              <p className="font-medium mb-2">Esta ação irá:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-destructive">
                <li>Deletar a conta permanentemente</li>
                <li>Remover todos os dados do usuário</li>
                <li>Apagar histórico, favoritos e playlists</li>
                <li>Cancelar assinatura no Stripe (se houver)</li>
              </ul>
            </div>
            <p className="text-destructive font-semibold">
              ⚠️ NÃO É POSSÍVEL DESFAZER ESTA AÇÃO!
            </p>
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
            {loading ? "Deletando..." : "⚠️ Sim, Deletar PERMANENTEMENTE"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};