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

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      console.log('[PAYMENT-PROCESSING] No session_id, redirecting to home');
      navigate('/');
      return;
    }

    console.log('[PAYMENT-PROCESSING] Session ID:', sessionId);
    
    // Verify payment and redirect after countdown
    const timer = setTimeout(async () => {
      try {
        // Verificar sessão no Stripe
        const { data: sessionData, error } = await supabase.functions.invoke('verify-session', {
          body: { sessionId }
        });

        if (error) {
          console.error('[PAYMENT-PROCESSING] Error verifying session:', error);
          navigate('/assinatura?error=verification_failed');
          return;
        }

        console.log('[PAYMENT-PROCESSING] Session verified:', sessionData);

        // Verificar autenticação
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // ✅ Usuário já autenticado (fluxo auth-first antigo)
          console.log('[PAYMENT-PROCESSING] User authenticated, redirecting to success');
          navigate('/assinatura/sucesso');
        } else {
          // 🆕 Usuário novo (fluxo pay-first)
          console.log('[PAYMENT-PROCESSING] New user, redirecting to onboarding');
          const email = sessionData?.email || '';
          navigate(`/onboarding/definir-senha?email=${encodeURIComponent(email)}`);
        }
      } catch (error) {
        console.error('[PAYMENT-PROCESSING] Exception:', error);
        navigate('/assinatura?error=verification_failed');
      }
    }, countdown * 1000);

    // Countdown visual
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(countdownInterval);
    };
  }, [navigate, searchParams]);

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
