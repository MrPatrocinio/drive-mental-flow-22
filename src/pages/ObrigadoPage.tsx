/**
 * ObrigadoPage - Página de agradecimento após inscrição
 * Responsabilidade: Confirmar conversão e guiar próximos passos (princípio SRP)
 * Princípio SoC: Separação entre UI de confirmação e lógica de tracking
 */

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { useAnalytics } from "@/hooks/useAnalytics";
import { 
  CheckCircle, 
  Heart, 
  Mail, 
  Users, 
  ArrowRight, 
  Share2,
  Download,
  Play,
  Star
} from "lucide-react";

interface LocationState {
  leadName?: string;
  leadEmail?: string;
}

export const ObrigadoPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { trackEvent } = useAnalytics();
  const [showConfetti, setShowConfetti] = useState(true);

  const state = location.state as LocationState;
  const leadName = state?.leadName || "Futuro Membro";
  const leadEmail = state?.leadEmail;

  useEffect(() => {
    // Tracking de visualização da página de conversão
    trackEvent('conversion_page_view', {
      lead_name: leadName,
      lead_email: leadEmail,
      timestamp: new Date().toISOString()
    });

    // GTM conversion event
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'conversion_completed',
        conversion_type: 'lead_signup',
        lead_name: leadName,
        lead_email: leadEmail,
        page_title: 'Obrigado - Drive Mental'
      });
    }

    // Remover confetti após animação
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [leadName, leadEmail, trackEvent]);

  const handleCTAClick = (action: string, destination?: string) => {
    trackEvent('thank_you_cta_click', {
      action,
      lead_name: leadName
    });

    if (destination) {
      navigate(destination);
    }
  };

  const handleShare = async (platform: string) => {
    trackEvent('social_share', {
      platform,
      page: 'thank_you',
      lead_name: leadName
    });

    const shareText = "Acabei de me inscrever no Drive Mental! Desenvolvimento mental que realmente funciona 🧠✨";
    const shareUrl = window.location.origin;

    if (navigator.share && platform === 'native') {
      try {
        await navigator.share({
          title: 'Drive Mental',
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Compartilhamento cancelado');
      }
    } else {
      // Fallback para redes sociais específicas
      let url = '';
      switch (platform) {
        case 'whatsapp':
          url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
          break;
        case 'telegram':
          url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
          break;
        case 'facebook':
          url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
          break;
        default:
          return;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const nextSteps = [
    {
      icon: Mail,
      title: "Verifique seu Email",
      description: "Enviamos um email de confirmação com seus primeiros conteúdos exclusivos",
      action: () => handleCTAClick('check_email')
    },
    {
      icon: Download,
      title: "Baixe o App",
      description: "Tenha acesso offline aos nossos áudios em qualquer lugar",
      action: () => handleCTAClick('download_app')
    },
    {
      icon: Users,
      title: "Junte-se à Comunidade",
      description: "Conecte-se com outras pessoas em jornada de desenvolvimento",
      action: () => handleCTAClick('join_community')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle relative overflow-hidden">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="confetti-animation">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-primary rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </div>
      )}

      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Success Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-success/10 rounded-full mb-6">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Muito Obrigado,
              <span className="bg-gradient-primary bg-clip-text text-transparent block">
                {leadName}!
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Sua inscrição foi realizada com sucesso! Você agora faz parte de uma comunidade 
              exclusiva de pessoas comprometidas com o desenvolvimento mental.
            </p>

            <div className="flex items-center justify-center space-x-2 text-success mb-8">
              <Heart className="h-5 w-5 fill-current" />
              <span className="font-medium">Bem-vindo à família Drive Mental!</span>
              <Heart className="h-5 w-5 fill-current" />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Próximos Passos */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Próximos Passos
              </h2>
              
              {nextSteps.map((step, index) => (
                <Card key={index} className="cursor-pointer hover:shadow-lg smooth-transition group">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-primary/10 p-3 rounded-lg group-hover:bg-primary/20 smooth-transition">
                        <step.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary smooth-transition">
                          {step.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          {step.description}
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={step.action}
                          className="group-hover:border-primary/50"
                        >
                          Executar
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* CTAs Principais */}
            <div className="space-y-8">
              {/* CTA Principal */}
              <Card className="shadow-elegant">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Comece Agora!</CardTitle>
                  <CardDescription>
                    Experimente nosso conteúdo gratuito enquanto prepara seu acesso completo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={() => handleCTAClick('start_demo', '/demo')}
                    className="w-full h-12 text-lg"
                    size="lg"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Experimentar Demo Gratuita
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => handleCTAClick('explore_fields', '/')}
                    className="w-full h-12"
                    size="lg"
                  >
                    Explorar Áreas de Desenvolvimento
                  </Button>
                </CardContent>
              </Card>

              {/* Compartilhamento Social */}
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="text-center">
                  <CardTitle className="text-lg">Compartilhe com Amigos</CardTitle>
                  <CardDescription>
                    Ajude outras pessoas a descobrir o poder do desenvolvimento mental
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare('whatsapp')}
                      className="flex-1"
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      WhatsApp
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare('facebook')}
                      className="flex-1"
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Facebook
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare('telegram')}
                      className="flex-1"
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Telegram
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Expectativas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Star className="mr-2 h-5 w-5 text-primary" />
                    O que Esperar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <span>Email de boas-vindas nos próximos minutos</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <span>Conteúdo exclusivo semanal adaptado ao seu interesse</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <span>Convites para eventos e workshops especiais</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <span>Acesso prioritário a novos conteúdos e funcionalidades</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Rodapé de Agradecimento */}
          <div className="text-center mt-16 pb-8">
            <p className="text-muted-foreground">
              Tem alguma dúvida? Entre em contato conosco pelo{" "}
              <a 
                href="mailto:contato@drivemental.com" 
                className="text-primary hover:underline"
                onClick={() => handleCTAClick('contact_email')}
              >
                contato@drivemental.com
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};