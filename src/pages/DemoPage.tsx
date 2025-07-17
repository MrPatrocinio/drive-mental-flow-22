import { Header } from "@/components/Header";
import { AudioPlayer } from "@/components/AudioPlayer";
import { Button } from "@/components/ui/button";
import { Heart, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DemoPage() {
  const navigate = useNavigate();

  // Áudio demo do campo Emocional
  const demoAudio = {
    id: "demo",
    title: "Controle da Ansiedade - Versão Demo",
    duration: "5:00",
    url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav", // Mock audio
    description: "Uma amostra do nosso conteúdo premium para você experimentar"
  };

  return (
    <div className="min-h-screen hero-gradient">
      <Header showBackButton />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6">
            <Heart className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Experimente o <span className="text-premium">Drive Mental</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Teste nossa tecnologia de reprogramação mental com este áudio demonstrativo 
            do campo Emocional
          </p>
        </div>

        {/* Demo Player */}
        <div className="mb-12">
          <AudioPlayer
            audioUrl={demoAudio.url}
            title={demoAudio.title}
            onRepeatComplete={() => {
              console.log("Demo repetition completed");
            }}
          />
        </div>

        {/* Instruções */}
        <div className="card-gradient rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-center">Como usar o Drive Mental</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-primary text-black font-bold flex items-center justify-center mx-auto mb-3">
                1
              </div>
              <h3 className="font-semibold mb-2">Escolha seu Campo</h3>
              <p className="text-sm text-muted-foreground">
                Selecione a área que deseja desenvolver
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-primary text-black font-bold flex items-center justify-center mx-auto mb-3">
                2
              </div>
              <h3 className="font-semibold mb-2">Ouça e Repita</h3>
              <p className="text-sm text-muted-foreground">
                Use fones de ouvido e deixe o áudio repetir
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-primary text-black font-bold flex items-center justify-center mx-auto mb-3">
                3
              </div>
              <h3 className="font-semibold mb-2">Transforme-se</h3>
              <p className="text-sm text-muted-foreground">
                Sua mente será reprogramada gradualmente
              </p>
            </div>
          </div>
        </div>

        {/* Benefícios */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Por que funciona?</h3>
            <div className="space-y-3 text-muted-foreground">
              <p>✓ Baseado em neurociência e programação neurolinguística</p>
              <p>✓ Repetição espaçada para fixação na mente subconsciente</p>
              <p>✓ Técnicas de visualização e afirmações positivas</p>
              <p>✓ Desenvolvido por especialistas em desenvolvimento humano</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Resultados esperados</h3>
            <div className="space-y-3 text-muted-foreground">
              <p>• Mudanças perceptíveis em 7-14 dias</p>
              <p>• Transformação profunda em 30-60 dias</p>
              <p>• Novos padrões mentais permanentes</p>
              <p>• Maior autoconfiança e bem-estar</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="card-gradient rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-3xl font-bold mb-4">
              Gostou do que ouviu?
            </h3>
            <p className="text-muted-foreground mb-6 text-lg">
              Este é apenas um exemplo. Temos mais de 44 áudios completos esperando por você.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="premium" 
                size="lg"
                onClick={() => navigate('/pagamento')}
                className="group"
              >
                Quero Acesso Completo
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/')}
              >
                Voltar ao Início
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}