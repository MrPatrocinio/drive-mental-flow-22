import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";
import { EnvironmentBadge } from "@/components/ui/environment-badge";
import { supabase } from "@/integrations/supabase/client";

/**
 * PaymentProcessingPage - Tela de transição após pagamento no Stripe
 * Responsabilidade (SRP): Comunicar status do processamento e redirecionar apropriadamente
 * Princípio KISS: Interface clara e direta
 */
export default function PaymentProcessingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      // Verifica se usuário está autenticado
      const { data: { session } } = await supabase.auth.getSession();
      
      // Timer visual para usuário ver a confirmação
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Redireciona baseado no estado de autenticação
            if (session?.user) {
              navigate(`/assinatura/sucesso?session_id=${sessionId}`);
            } else {
              navigate(`/login?redirect=/assinatura/sucesso&session_id=${sessionId}`);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    };

    if (sessionId) {
      checkAuthAndRedirect();
    } else {
      // Sem session_id, redireciona para home
      navigate("/");
    }
  }, [sessionId, navigate]);

  return (
    <div className="min-h-screen hero-gradient">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center mb-6">
            <EnvironmentBadge />
          </div>

          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">
              Pagamento Confirmado!
            </h1>
            <p className="text-lg text-muted-foreground">
              Processado com sucesso pelo Stripe
            </p>
          </div>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50 mb-8">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Pagamento Confirmado</p>
                    <p className="text-sm text-muted-foreground">
                      Seu pagamento foi processado com sucesso pelo Stripe
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Loader2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0 animate-spin" />
                  <div>
                    <p className="font-semibold">Preparando Sua Conta</p>
                    <p className="text-sm text-muted-foreground">
                      Estamos ativando seu acesso premium ao Drive Mental
                    </p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <p className="text-center text-sm text-muted-foreground">
                    Redirecionando em <span className="font-bold text-primary text-lg">{countdown}</span> segundos...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              🔒 Transação segura processada via Stripe
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
