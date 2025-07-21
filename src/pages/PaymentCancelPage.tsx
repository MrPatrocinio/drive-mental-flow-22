
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ArrowLeft, CreditCard } from "lucide-react";

export default function PaymentCancelPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen hero-gradient">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold mb-2">
              Pagamento Cancelado
            </h1>
            <p className="text-lg text-muted-foreground">
              Não se preocupe, nenhuma cobrança foi efetuada
            </p>
          </div>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                O que aconteceu?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Você cancelou o processo de pagamento antes de concluí-lo. Isso pode ter acontecido porque:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Você fechou a janela de pagamento</li>
                <li>Clicou no botão "Voltar" do navegador</li>
                <li>Teve problemas com o método de pagamento</li>
                <li>Decidiu não finalizar a compra no momento</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 mb-8">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Ainda interessado?</h3>
              <div className="space-y-2 text-sm">
                <p>• Acesso vitalício por apenas R$ 97</p>
                <p>• Mais de 44 áudios exclusivos</p>
                <p>• 6 campos completos de desenvolvimento</p>
                <p>• Garantia de 30 dias</p>
              </div>
            </CardContent>
          </Card>

          <div className="text-center space-y-4">
            <div className="space-x-4">
              <Button 
                onClick={() => navigate("/pagamento")} 
                variant="premium" 
                size="lg"
              >
                Tentar Novamente
              </Button>
              
              <Button 
                onClick={() => navigate("/")} 
                variant="outline"
                size="lg"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Início
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Precisa de ajuda? Entre em contato com nosso suporte
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
