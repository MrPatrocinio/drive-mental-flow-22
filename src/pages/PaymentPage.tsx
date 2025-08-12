import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Shield, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PricingService, PricingInfo } from "@/services/supabase/pricingService";
import { PromotionService } from "@/services/promotionService";
import { useDataSync } from "@/hooks/useDataSync";
import { Countdown } from "@/components/ui/countdown";
import { PromotionBadge } from "@/components/ui/promotion-badge";
import { EnvironmentBadge } from "@/components/ui/environment-badge";
import { TestCardInfo } from "@/components/payment/TestCardInfo";
import { StripePaymentService } from "@/services/stripe/stripePaymentService";
import { StripeEnvironmentService } from "@/services/stripe/stripeEnvironmentService";

export default function PaymentPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    name: ""
  });
  const [error, setError] = useState("");
  const [pricingData, setPricingData] = useState<PricingInfo | null>(null);
  const [isPricingLoading, setIsPricingLoading] = useState(true);
  const { toast } = useToast();

  const envInfo = StripeEnvironmentService.getEnvironmentInfo();

  const loadPricingData = async () => {
    try {
      setIsPricingLoading(true);
      const data = await PricingService.get();
      setPricingData(data || PricingService.getDefaultPricing());
    } catch (error) {
      console.error('Erro ao carregar dados de pricing:', error);
      setPricingData(PricingService.getDefaultPricing());
    } finally {
      setIsPricingLoading(false);
    }
  };

  useEffect(() => {
    loadPricingData();
  }, []);

  useDataSync({
    onContentChange: () => {
      loadPricingData();
    }
  });

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
      const result = await StripePaymentService.createPaymentSession(formData);
      
      if (!result.success) {
        setError(result.error || "Erro desconhecido");
        toast({
          title: "Erro no pagamento",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      if (result.url) {
        console.log("Redirecionando para:", result.url);
        window.location.href = result.url;
      }
      
    } catch (error) {
      console.error("Erro inesperado:", error);
      setError("Erro interno do servidor");
      toast({
        title: "Erro no pagamento",
        description: "Erro interno do servidor",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return `${currency} ${price.toFixed(2).replace('.', ',')}`;
  };

  const promotion = pricingData ? PromotionService.calculatePromotion(pricingData) : null;

  const getCurrentPrice = () => {
    if (!pricingData) return 'R$ 97';
    const price = promotion?.isValid ? promotion.discountedPrice : pricingData.price;
    return formatPrice(price, pricingData.currency);
  };

  const getBenefits = () => {
    if (!pricingData) {
      return [
        "Acesso a mais de 44 áudios exclusivos",
        "6 campos completos de desenvolvimento",
        "Player avançado com repetição automática",
        "Atualizações mensais de conteúdo",
        "Suporte prioritário",
        "Garantia de 30 dias"
      ];
    }
    return pricingData.benefits;
  };

  const getButtonText = () => {
    if (!pricingData) return 'Começar Agora';
    return pricingData.button_text;
  };

  return (
    <div className="min-h-screen hero-gradient w-full overflow-x-hidden">
      <Header showBackButton />
      
      <div className="w-full max-w-none">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-6xl mx-auto">
            {/* Environment Badge */}
            <div className="flex justify-center mb-6">
              <EnvironmentBadge />
            </div>

            <div className="text-center mb-8 md:mb-12 px-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                Transforme sua vida por apenas
              </h1>
              
              {isPricingLoading ? (
                <div className="h-16 bg-muted/50 rounded animate-pulse mb-4"></div>
              ) : (
                <div className="space-y-4">
                  {promotion?.isValid && pricingData?.promotion_label && (
                    <div className="flex justify-center">
                      <PromotionBadge 
                        label={pricingData.promotion_label}
                        discount={pricingData.discount_percentage}
                      />
                    </div>
                  )}
                  
                  {promotion?.isValid ? (
                    <div className="space-y-2">
                      <div className="text-2xl md:text-3xl text-muted-foreground line-through">
                        {formatPrice(promotion.originalPrice, pricingData?.currency || 'R$')}
                      </div>
                      <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-premium">
                        {getCurrentPrice()}
                      </div>
                      {promotion.timeRemaining && pricingData?.promotion_end_date && (
                        <Countdown 
                          endDate={pricingData.promotion_end_date}
                          className="justify-center"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-premium mb-4">
                      {getCurrentPrice()}
                    </div>
                  )}
                </div>
              )}
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                {pricingData ? `${pricingData.payment_type} • ${pricingData.access_type}` : 'Acesso vitalício a todo conteúdo do Drive Mental'}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {/* Formulário de Pagamento */}
              <div className="space-y-6">
                <Card className="w-full max-w-none bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                      <CreditCard className="h-5 w-5 shrink-0" />
                      Dados para Pagamento
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {envInfo.description}
                    </p>
                  </CardHeader>
                  <CardContent className="px-4 md:px-6">
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
                          className="w-full min-h-[48px] text-sm md:text-base"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            "Redirecionando..."
                          ) : (
                            <>
                              <span className="hidden sm:inline">{getButtonText()} - {getCurrentPrice()}</span>
                              <span className="sm:hidden">Pagar {getCurrentPrice()}</span>
                            </>
                          )}
                        </Button>
                      </div>

                      <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-muted-foreground text-center">
                        <Shield className="h-4 w-4 shrink-0" />
                        <span>Pagamento 100% seguro e criptografado</span>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {/* Test Card Info */}
                {envInfo.isTestMode && <TestCardInfo />}
              </div>

              {/* Resumo e Benefícios */}
              <div className="w-full max-w-none space-y-6">
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg md:text-xl">O que você recebe</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 md:px-6">
                    {isPricingLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div key={i} className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-muted animate-pulse shrink-0 mt-0.5"></div>
                            <div className="h-4 bg-muted rounded animate-pulse flex-1"></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {getBenefits().map((benefit, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="h-3 w-3 text-primary" />
                            </div>
                            <span className="text-sm md:text-base leading-relaxed">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
                  <CardContent className="p-4 md:p-6">
                    <div className="text-center">
                      <h3 className="font-semibold mb-2 text-base md:text-lg">Garantia de 30 dias</h3>
                      <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                        Se não estiver satisfeito, devolvemos 100% do seu dinheiro
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="text-center text-xs md:text-sm text-muted-foreground px-2">
                  <p className="leading-relaxed">
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
    </div>
  );
}
