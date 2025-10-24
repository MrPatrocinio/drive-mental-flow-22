import { useState, useEffect } from "react";
import { X, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/**
 * WelcomeMessage - Banner de boas-vindas para novos assinantes
 * Responsabilidade (SRP): Exibir mensagem de boas-vindas uma única vez após assinatura
 * Princípio KISS: Banner simples que pode ser fechado
 */
export const WelcomeMessage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Verifica se usuário acabou de assinar
    const justSubscribed = localStorage.getItem('justSubscribed');
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcomeBanner');
    
    if (justSubscribed === 'true' && !hasSeenWelcome) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('hasSeenWelcomeBanner', 'true');
    localStorage.removeItem('justSubscribed');
  };

  if (!isVisible) return null;

  return (
    <Card className="bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 border-primary/30 mb-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
      
      <div className="relative p-6">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center flex-shrink-0 shadow-lg">
            <Crown className="h-6 w-6 text-white" />
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              Bem-vindo ao Drive Mental Premium!
            </h3>
            <p className="text-muted-foreground mb-4">
              Sua assinatura está ativa! Agora você tem acesso completo a:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Todos os áudios premium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Downloads para offline</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Conteúdos exclusivos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Novos conteúdos mensais</span>
              </div>
            </div>

            <Button 
              onClick={handleClose}
              variant="default"
              size="sm"
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              Começar Agora
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
