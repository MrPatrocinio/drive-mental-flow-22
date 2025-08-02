import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { ArrowRight, Brain, Heart, Target, DollarSign, Activity, Sparkles, Play, Users, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SupabaseContentService, LandingPageContent } from "@/services/supabase/contentService";
import { VideoService, Video } from "@/services/supabase/videoService";
import { FieldService } from "@/services/supabase/fieldService";
import { useDataSync } from "@/hooks/useDataSync";
import { PricingDisplay } from "@/components/PricingDisplay";
import * as Icons from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const [content, setContent] = useState<LandingPageContent | null>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);

  // Get dynamic icon component
  const getIconComponent = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent || Brain; // Fallback to Brain icon
  };

  const loadContent = useCallback(async () => {
    try {
      const [landingContent, fieldsData, videoData] = await Promise.all([
        SupabaseContentService.getLandingPageContent(),
        FieldService.getAll(),
        VideoService.getActiveVideo()
      ]);
      
      setContent(landingContent);
      setActiveVideo(videoData);
      setFields(fieldsData.map(field => ({
        icon: getIconComponent(field.icon_name),
        title: field.title,
        count: `${field.audio_count} áudio${field.audio_count !== 1 ? 's' : ''}`
      })));
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  // Setup data sync
  useDataSync({
    onFieldsChange: loadContent,
    onContentChange: loadContent,
    onVideosChange: loadContent
  });

  if (loading || !content) {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-lg text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen hero-gradient">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-foreground">{content.hero.title}</span>
              <br />
              <span className="text-premium">{content.hero.titleHighlight}</span>
            </h1>
            
            {/* Video Section */}
            {activeVideo && (
              <div className="mb-8">
                <div className="max-w-4xl mx-auto">
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' /* 16:9 aspect ratio */ }}>
                    <iframe
                      className="absolute top-0 left-0 w-full h-full rounded-xl shadow-2xl"
                      src={activeVideo.url}
                      title={activeVideo.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  {activeVideo.description && (
                    <p className="text-center text-muted-foreground mt-4 max-w-2xl mx-auto">
                      {activeVideo.description}
                    </p>
                  )}
                </div>
              </div>
            )}
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
              <Button 
                variant="ghost" 
                size="lg"
                onClick={() => navigate('/auth')}
                className="text-primary hover:text-primary/90"
              >
                Já tem conta? Faça login
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

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Invista em seu <span className="text-premium">Desenvolvimento</span>
          </h2>
          <p className="text-center text-muted-foreground mb-12 text-lg">
            Comece sua transformação hoje mesmo
          </p>
          <PricingDisplay />
          <div className="text-center mt-8">
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
        <div className="container mx-auto">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              {content.footer.copyright}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
              <span className="text-muted-foreground">{content.footer.lgpdText}</span>
              <div className="flex gap-4">
                <a href={content.footer.lgpdLink} className="text-primary hover:text-primary/80 transition-colors">
                  LGPD
                </a>
                <a href={content.footer.privacyPolicyLink} className="text-primary hover:text-primary/80 transition-colors">
                  Política de Privacidade
                </a>
                <a href={content.footer.termsOfServiceLink} className="text-primary hover:text-primary/80 transition-colors">
                  Termos de Uso
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}