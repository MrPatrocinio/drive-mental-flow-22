
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Shield, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PaymentPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    name: ""
  });
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (!formData.email || !formData.name) {
        throw new Error("Por favor, preencha todos os campos obrigatórios");
      }

      console.log("Iniciando pagamento para:", formData);

      // Call the create-payment edge function
      const { data, error: functionError } = await supabase.functions.invoke('create-payment', {
        body: {
          email: formData.email,
          name: formData.name
        }
      });

      if (functionError) {
        throw new Error(functionError.message || "Erro ao criar sessão de pagamento");
      }

      if (!data?.url) {
        throw new Error("URL de pagamento não recebida");
      }

      console.log("Redirecionando para:", data.url);

      // Redirect to Stripe Checkout
      window.location.href = data.url;
      
    } catch (error) {
      console.error("Erro no pagamento:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro interno do servidor";
      setError(errorMessage);
      toast({
        title: "Erro no pagamento",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    "Acesso a mais de 44 áudios exclusivos",
    "6 campos completos de desenvolvimento",
    "Player avançado com repetição automática",
    "Atualizações mensais de conteúdo",
    "Suporte prioritário",
    "Garantia de 30 dias"
  ];

  return (
    <div className="min-h-screen hero-gradient">
      <Header showBackButton />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Transforme sua vida por apenas
            </h1>
            <div className="text-6xl md:text-7xl font-bold text-premium mb-4">
              R$ 97
            </div>
            <p className="text-xl text-muted-foreground">
              Acesso vitalício a todo conteúdo do Drive Mental
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Formulário de Pagamento */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Dados para Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handlePayment} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input 
                      id="email"
                      name="email"
                      type="email" 
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input 
                      id="name"
                      name="name"
                      type="text" 
                      placeholder="Seu nome completo"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <Separator />

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">
                      <Shield className="h-4 w-4 inline mr-1" />
                      Pagamento processado pelo Stripe
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Você será redirecionado para a página segura do Stripe para inserir os dados do cartão
                    </p>
                  </div>

                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      variant="premium" 
                      size="lg" 
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        "Redirecionando para pagamento..."
                      ) : (
                        "Prosseguir para Pagamento - R$ 97"
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>Pagamento 100% seguro e criptografado</span>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Resumo e Benefícios */}
            <div className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle>O que você recebe</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="font-semibold mb-2">Garantia de 30 dias</h3>
                    <p className="text-sm text-muted-foreground">
                      Se não estiver satisfeito, devolvemos 100% do seu dinheiro
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center text-sm text-muted-foreground">
                <p>
                  Ao finalizar a compra, você concorda com nossos{" "}
                  <span className="text-primary cursor-pointer hover:underline">
                    Termos de Uso
                  </span>{" "}
                  e{" "}
                  <span className="text-primary cursor-pointer hover:underline">
                    Política de Privacidade
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
