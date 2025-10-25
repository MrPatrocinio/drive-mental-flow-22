import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Eye, MoreVertical } from "lucide-react";
import { GuaranteeStatus } from "@/hooks/useGuarantee";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface GuaranteeTableProps {
  guarantees: GuaranteeStatus[];
  onViewDetails: (guarantee: GuaranteeStatus) => void;
}

const getStateBadge = (state: string) => {
  const badges: Record<string, { variant: any; label: string }> = {
    unconditional_window: { variant: 'default', label: '7 dias' },
    conditional_running: { variant: 'secondary', label: 'Acompanhamento' },
    conditional_met: { variant: 'default', label: 'Cumpriu 21d' },
    expired: { variant: 'secondary', label: 'Expirado' },
    refunded: { variant: 'default', label: 'Reembolsado' },
    denied: { variant: 'destructive', label: 'Negado' },
  };

  const config = badges[state] || { variant: 'secondary', label: state };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export const GuaranteeTable = ({ guarantees, onViewDetails }: GuaranteeTableProps) => {
  return (
    <div className="border border-border/50 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead>Usuário ID</TableHead>
            <TableHead>Início</TableHead>
            <TableHead>Até 7d</TableHead>
            <TableHead>Até 30d</TableHead>
            <TableHead>Progresso (21d)</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {guarantees.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                Nenhuma garantia encontrada
              </TableCell>
            </TableRow>
          ) : (
            guarantees.map((guarantee) => (
              <TableRow key={guarantee.id} className="hover:bg-muted/20">
                <TableCell className="font-mono text-xs">
                  {guarantee.user_id.slice(0, 8)}...
                </TableCell>
                <TableCell>
                  {format(new Date(guarantee.start_date), 'dd/MM/yyyy', { locale: ptBR })}
                </TableCell>
                <TableCell>
                  {format(new Date(guarantee.unconditional_until), 'dd/MM/yyyy', { locale: ptBR })}
                </TableCell>
                <TableCell>
                  {format(new Date(guarantee.monitoring_until), 'dd/MM/yyyy', { locale: ptBR })}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={(guarantee.best_len / 21) * 100} className="w-20" />
                    <span className="text-xs text-muted-foreground">
                      {guarantee.best_len}/21
                    </span>
                  </div>
                </TableCell>
                <TableCell>{getStateBadge(guarantee.computed_state)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(guarantee)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
