
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, CreditCard, Mail, User, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setError("ID da sessão não encontrado");
        setIsLoading(false);
        return;
      }

      try {
        console.log("Verificando pagamento para sessão:", sessionId);

        const { data, error: functionError } = await supabase.functions.invoke('verify-payment', {
          body: { sessionId }
        });

        if (functionError) {
          throw new Error(functionError.message || "Erro ao verificar pagamento");
        }

        console.log("Dados do pagamento:", data);
        setPaymentData(data);

        if (data.paymentStatus === "paid") {
          toast({
            title: "Pagamento confirmado!",
            description: "Bem-vindo ao Drive Mental. Seu acesso foi liberado.",
          });
        }
      } catch (error) {
        console.error("Erro ao verificar pagamento:", error);
        setError(error instanceof Error ? error.message : "Erro ao verificar pagamento");
      } finally {
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, toast]);

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency?.toUpperCase() || 'BRL',
    }).format(amount / 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen hero-gradient">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg">Verificando seu pagamento...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !paymentData) {
    return (
      <div className="min-h-screen hero-gradient">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error || "Não foi possível verificar o pagamento"}
              </AlertDescription>
            </Alert>
            <div className="text-center mt-6">
              <Button onClick={() => navigate("/")} variant="outline">
                Voltar ao início
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isPaid = paymentData.paymentStatus === "paid";

  return (
    <div className="min-h-screen hero-gradient">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              isPaid ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
            }`}>
              <Check className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {isPaid ? "Pagamento Confirmado!" : "Processando Pagamento..."}
            </h1>
            <p className="text-lg text-muted-foreground">
              {isPaid 
                ? "Bem-vindo ao Drive Mental! Seu acesso foi liberado." 
                : "Seu pagamento está sendo processado. Aguarde alguns minutos."
              }
            </p>
          </div>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Detalhes da Compra
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Cliente:</span>
                <span>{paymentData.customerName}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Email:</span>
                <span>{paymentData.customerEmail}</span>
              </div>

              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Valor:</span>
                <span className="font-semibold">
                  {formatAmount(paymentData.amount, paymentData.currency)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isPaid 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {isPaid ? "Pago" : "Processando"}
                </span>
              </div>
            </CardContent>
          </Card>

          {isPaid && (
            <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 mb-8">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Próximos Passos:</h3>
                <div className="space-y-2 text-sm">
                  <p>✅ Sua conta foi ativada automaticamente</p>
                  <p>✅ Você já pode acessar todo o conteúdo</p>
                  <p>✅ Um email de confirmação será enviado em breve</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="text-center space-y-4">
            {isPaid ? (
              <Button 
                onClick={() => navigate("/dashboard")} 
                variant="premium" 
                size="lg"
                className="w-full sm:w-auto"
              >
                Acessar Dashboard
              </Button>
            ) : (
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                className="w-full sm:w-auto"
              >
                Verificar Novamente
              </Button>
            )}
            
            <div>
              <Button 
                onClick={() => navigate("/")} 
                variant="ghost"
              >
                Voltar ao início
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
