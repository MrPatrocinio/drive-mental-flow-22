import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { ArrowRight, Brain, Heart, Target, DollarSign, Activity, Sparkles, Play, Users, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ContentService, LandingPageContent } from "@/services/contentService";
import * as Icons from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const [content, setContent] = useState<LandingPageContent>(() => 
    ContentService.getLandingPageContent()
  );

  useEffect(() => {
    // Refresh content when component mounts
    setContent(ContentService.getLandingPageContent());
  }, []);

  // Get dynamic icon component
  const getIconComponent = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent || Brain; // Fallback to Brain icon
  };

  const fields = ContentService.getEditableFields().map(field => ({
    icon: getIconComponent(field.iconName),
    title: field.title,
    count: `${field.audioCount} áudio${field.audioCount !== 1 ? 's' : ''}`
  }));

  return (
    <div className="min-h-screen hero-gradient">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              {content.hero.title.split(' ').map((word, index, words) => {
                // Make last two words premium colored
                const isLastTwoWords = index >= words.length - 2;
                return (
                  <span key={index} className={isLastTwoWords ? "text-premium block" : ""}>
                    {word}{index < words.length - 1 ? " " : ""}
                  </span>
                );
              })}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              {content.hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="premium" 
                size="lg" 
                onClick={() => navigate('/pagamento')}
                className="group"
              >
                {content.hero.ctaText}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/demo')}
              >
                <Play className="mr-2 h-5 w-5" />
                {content.hero.demoText}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Por que escolher o <span className="text-premium">Drive Mental</span>?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {content.features.map((feature, index) => (
              <div 
                key={feature.id} 
                className="field-card text-center animate-fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  {React.createElement(getIconComponent(feature.icon), { className: "h-8 w-8 text-primary" })}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Campos Disponíveis */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Campos de <span className="text-premium">Desenvolvimento</span>
          </h2>
          <p className="text-center text-muted-foreground mb-12 text-lg">
            Escolha sua área de foco e comece sua jornada de transformação
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {fields.map((field, index) => (
              <div 
                key={index} 
                className="field-card group cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 smooth-transition">
                    <field.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{field.title}</h3>
                    <p className="text-sm text-muted-foreground">{field.count}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="card-gradient rounded-2xl p-12 max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pronto para transformar sua vida?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Junte-se a milhares de pessoas que já transformaram suas vidas com o Drive Mental
            </p>
            <Button 
              variant="premium" 
              size="lg"
              onClick={() => navigate('/pagamento')}
              className="animate-pulse-glow"
            >
              {content.hero.ctaText}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-4">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground">
            {content.footer.copyright}
          </p>
        </div>
      </footer>
    </div>
  );
}