import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, TrendingUp, CheckCircle, XCircle } from "lucide-react";
import { GuaranteeStatus } from "@/hooks/useGuarantee";

interface GuaranteeKPICardsProps {
  guarantees: GuaranteeStatus[];
}

export const GuaranteeKPICards = ({ guarantees }: GuaranteeKPICardsProps) => {
  const counts = {
    unconditional: guarantees.filter(g => g.computed_state === 'unconditional_window').length,
    running: guarantees.filter(g => g.computed_state === 'conditional_running').length,
    met: guarantees.filter(g => g.computed_state === 'conditional_met').length,
    closed: guarantees.filter(g => ['refunded', 'denied', 'expired'].includes(g.computed_state)).length,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">7 Dias (Incondicional)</CardTitle>
          <Clock className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{counts.unconditional}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Período de reembolso garantido
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Em Acompanhamento</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{counts.running}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Monitorando 21 dias consecutivos
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cumpriram 21 Dias</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{counts.met}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Elegíveis para reembolso condicional
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Encerrados</CardTitle>
          <XCircle className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{counts.closed}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Reembolsados, negados ou expirados
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
