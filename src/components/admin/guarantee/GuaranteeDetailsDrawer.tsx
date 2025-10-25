import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GuaranteeStatus, GuaranteeDaily, useGuarantee } from "@/hooks/useGuarantee";
import { Calendar, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { GuaranteeDenyDialog } from "./GuaranteeDenyDialog";

interface GuaranteeDetailsDrawerProps {
  guarantee: GuaranteeStatus | null;
  open: boolean;
  onClose: () => void;
  onRefund: (enrollmentId: string) => Promise<void>;
  onDeny: (enrollmentId: string, reason: string) => Promise<void>;
}

export const GuaranteeDetailsDrawer = ({ 
  guarantee, 
  open, 
  onClose,
  onRefund,
  onDeny
}: GuaranteeDetailsDrawerProps) => {
  const [dailyData, setDailyData] = useState<GuaranteeDaily[]>([]);
  const [loading, setLoading] = useState(false);
  const [denyDialogOpen, setDenyDialogOpen] = useState(false);
  const { getGuaranteeDaily } = useGuarantee();

  useEffect(() => {
    if (guarantee && open) {
      loadDailyData();
    }
  }, [guarantee, open]);

  const loadDailyData = async () => {
    if (!guarantee) return;
    
    setLoading(true);
    const data = await getGuaranteeDaily(guarantee.id);
    setDailyData(data);
    setLoading(false);
  };

  if (!guarantee) return null;

  const daysRemaining7 = differenceInDays(new Date(guarantee.unconditional_until), new Date());
  const daysRemaining30 = differenceInDays(new Date(guarantee.monitoring_until), new Date());
  const isDecided = ['refunded', 'denied', 'expired'].includes(guarantee.status);

  // Criar grid de 30 dias
  const days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(guarantee.start_date);
    date.setDate(date.getDate() + i);
    return date;
  });

  const getDayData = (date: Date) => {
    const dayStr = format(date, 'yyyy-MM-dd');
    return dailyData.find(d => d.day === dayStr);
  };

  const getDayColor = (date: Date) => {
    const dayData = getDayData(date);
    if (!dayData) return 'bg-muted/30';
    if (dayData.meets_20) return 'bg-green-500/20 border-green-500/50';
    if (dayData.plays_valid > 0) return 'bg-yellow-500/20 border-yellow-500/50';
    return 'bg-muted/30';
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Detalhes da Garantia</SheetTitle>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Info do usuário */}
            <Card className="bg-card/50">
              <CardHeader>
                <CardTitle className="text-sm">Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">User ID:</span>
                  <span className="font-mono">{guarantee.user_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Purchase ID:</span>
                  <span className="font-mono text-xs">{guarantee.purchase_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Início:</span>
                  <span>{format(new Date(guarantee.start_date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                </div>
              </CardContent>
            </Card>

            {/* Regra atual */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {guarantee.computed_state === 'unconditional_window' && (
                  <span>
                    <strong>Dentro dos 7 dias:</strong> Reembolso incondicional disponível.
                    {daysRemaining7 >= 0 && <> Restam <strong>{daysRemaining7} dias</strong>.</>}
                  </span>
                )}
                {guarantee.computed_state === 'conditional_running' && (
                  <span>
                    <strong>Garantia condicional em andamento.</strong> Melhor sequência: <strong>{guarantee.best_len}/21</strong> dias.
                    {daysRemaining30 >= 0 && <> Restam <strong>{daysRemaining30} dias</strong> de monitoramento.</>}
                  </span>
                )}
                {guarantee.computed_state === 'conditional_met' && (
                  <span>
                    <strong>Condição cumprida:</strong> Usuário atingiu 21 dias consecutivos com ≥20 plays. Elegível a reembolso.
                  </span>
                )}
                {guarantee.computed_state === 'expired' && (
                  <span>
                    <strong>Expirado:</strong> Janela de monitoramento encerrada sem cumprir os 21 dias consecutivos.
                  </span>
                )}
                {guarantee.status === 'refunded' && (
                  <span>
                    <strong>Reembolsado:</strong> {guarantee.decision_reason}
                  </span>
                )}
                {guarantee.status === 'denied' && (
                  <span>
                    <strong>Negado:</strong> {guarantee.decision_reason}
                  </span>
                )}
              </AlertDescription>
            </Alert>

            {/* Calendário de 30 dias */}
            <Card className="bg-card/50">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Calendário de Atividade (30 dias)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center text-muted-foreground py-8">Carregando...</div>
                ) : (
                  <>
                    <div className="grid grid-cols-6 gap-2 mb-4">
                      {days.map((date, i) => {
                        const dayData = getDayData(date);
                        return (
                          <div
                            key={i}
                            className={`aspect-square rounded border ${getDayColor(date)} flex items-center justify-center text-xs font-medium transition-colors`}
                            title={`${format(date, 'dd/MM/yyyy')}: ${dayData?.plays_valid || 0} plays`}
                          >
                            {format(date, 'd')}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground justify-center">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-green-500/20 border border-green-500/50" />
                        ≥20 plays
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-yellow-500/20 border border-yellow-500/50" />
                        1-19 plays
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-muted/30" />
                        0 plays
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Ações */}
            {!isDecided && (
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => onRefund(guarantee.id)}
                  variant="default"
                  className="w-full"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aprovar Reembolso
                </Button>
                <Button
                  onClick={() => setDenyDialogOpen(true)}
                  variant="destructive"
                  className="w-full"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Negar Pedido
                </Button>
              </div>
            )}

            {isDecided && (
              <Alert>
                <AlertDescription className="text-center">
                  Garantia já foi decidida em{' '}
                  {guarantee.decided_at && format(new Date(guarantee.decided_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <GuaranteeDenyDialog
        open={denyDialogOpen}
        onClose={() => setDenyDialogOpen(false)}
        onDeny={(reason) => {
          onDeny(guarantee.id, reason);
          setDenyDialogOpen(false);
        }}
      />
    </>
  );
};
