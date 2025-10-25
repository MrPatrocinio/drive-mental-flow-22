import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface GuaranteeDenyDialogProps {
  open: boolean;
  onClose: () => void;
  onDeny: (reason: string) => void;
}

export const GuaranteeDenyDialog = ({ open, onClose, onDeny }: GuaranteeDenyDialogProps) => {
  const [reason, setReason] = useState("");

  const handleDeny = () => {
    if (reason.trim().length === 0) {
      return;
    }
    onDeny(reason);
    setReason("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Negar Pedido de Garantia</DialogTitle>
          <DialogDescription>
            Informe o motivo da negação. Esta informação será registrada no sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo da Negação *</Label>
            <Textarea
              id="reason"
              placeholder="Ex: Usuário não cumpriu os 21 dias consecutivos com ≥20 plays/dia"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              required
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeny}
            disabled={reason.trim().length === 0}
          >
            Confirmar Negação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
