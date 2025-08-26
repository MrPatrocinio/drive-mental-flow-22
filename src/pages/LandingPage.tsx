
import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { LandingPageMobileHeader } from "@/components/mobile/LandingPageMobileHeader";
import { LandingPageBottomNav } from "@/components/mobile/LandingPageBottomNav";
import { ArrowRight, Brain, Heart, Target, DollarSign, Activity, Sparkles, Play, Users, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { VideoService, Video } from "@/services/supabase/videoService";
import { FieldService } from "@/services/supabase/fieldService";
import { useDataSync } from "@/hooks/useDataSync";
import { useVideoControls } from "@/hooks/useVideoControls";
import { useVideoLifecycle } from "@/hooks/useVideoLifecycle";
import { useLandingContent } from "@/hooks/useLandingContent";
import { SubscriptionPlans } from "@/components/subscription/SubscriptionPlans";
import { SyncStatusIndicator } from "@/components/SyncStatusIndicator";
import { EnhancedRefreshButton } from "@/components/EnhancedRefreshButton";
import * as Icons from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Usar o novo hook para conteúdo da landing
  const { content, loading: contentLoading, error: contentError, refreshContent } = useLandingContent();
  
  const [fields, setFields] = useState<any[]>([]);
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [fieldsLoading, setFieldsLoading] = useState(true);
  
  // Loading geral
  const loading = contentLoading || fieldsLoading;
  
  console.log('LandingPage: Renderizando', { 
    isMobile, 
    contentLoading, 
    fieldsLoading, 
    hasContent: !!content,
    contentError 
  });
  
  // Hooks para controles e lifecycle de vídeo
  const videoControlsSettings = useVideoControls(activeVideo?.video_controls);
  const { isVideoReady, videoKey, cleanupPreviousVideo } = useVideoLifecycle(activeVideo);

  // Get dynamic icon component
  const getIconComponent = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent || Brain;
  };

  const loadFieldsAndVideo = useCallback(async () => {
    try {
      console.log('LandingPage: Carregando fields e vídeo');
      setFieldsLoading(true);
      
      const [fieldsData, videoData] = await Promise.all([
        FieldService.getAll(),
        VideoService.getActiveVideo()
      ]);
      
      console.log('LandingPage: Fields e vídeo carregados:', { fieldsData, videoData });
      
      // Verificar se o vídeo realmente mudou antes de atualizar
      if (videoData?.id !== activeVideo?.id) {
        console.log('LandingPage: Novo vídeo detectado:', videoData?.id);
        setActiveVideo(videoData);
      }
      
      setFields(fieldsData.map(field => ({
        icon: getIconComponent(field.icon_name),
        title: field.title,
        count: `${field.audio_count} áudio${field.audio_count !== 1 ? 's' : ''}`
      })));
    } catch (error) {
      console.error('LandingPage: Erro ao carregar fields e vídeo:', error);
    } finally {
      console.log('LandingPage: Finalizando carregamento de fields');
      setFieldsLoading(false);
    }
  }, [activeVideo?.id]);

  useEffect(() => {
    loadFieldsAndVideo();
  }, [loadFieldsAndVideo]);

  // Setup data sync para fields e vídeos
  useDataSync({
    onFieldsChange: loadFieldsAndVideo,
    onVideosChange: loadFieldsAndVideo
  });

  const renderVideoPlayer = () => {
    if (!activeVideo || !isVideoReady) return null;

    const isAtomicatHtml = activeVideo.type === 'atomicat' && VideoService.isAtomicatHtml(activeVideo.url);
    const isAtomicatUrl = activeVideo.type === 'atomicat' && !VideoService.isAtomicatHtml(activeVideo.url);
    const isHLS = VideoService.isHLSStream(activeVideo.url);

    // Para HTML da Atomicat, usar data URL com permissões otimizadas
    if (isAtomicatHtml) {
      const videoUrl = VideoService.generateVideoUrlWithControls(activeVideo.url, {
        ...activeVideo.video_controls,
        autoplay: false,
        muted: true
      });

      console.log('LandingPage: Renderizando Atomicat HTML com data URL', {
        isHLS,
        dataUrlLength: videoUrl.length
      });

      return (
        <iframe
          key={videoKey}
          className="absolute top-0 left-0 w-full h-full shadow-2xl"
          src={videoUrl}
          title={activeVideo.title}
          frameBorder="0"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation allow-downloads allow-storage-access-by-user-activation"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen; accelerometer; gyroscope; microphone; camera; cross-origin-isolated"
          allowFullScreen={videoControlsSettings.allowFullscreen}
          onLoad={() => {
            console.log('LandingPage: Iframe da Atomicat carregado com data URL');
          }}
          onError={(e) => {
            console.error('LandingPage: Erro no iframe da Atomicat:', e);
          }}
          style={{
            pointerEvents: videoControlsSettings.pointerEvents
          }}
        />
      );
    }

    // Para URLs diretas da Atomicat
    if (isAtomicatUrl) {
      return (
        <iframe
          key={videoKey}
          className="absolute top-0 left-0 w-full h-full shadow-2xl"
          src={VideoService.generateVideoUrlWithControls(activeVideo.url, {
            ...activeVideo.video_controls,
            autoplay: false,
            muted: true
          })}
          title={activeVideo.title}
          frameBorder="0"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation allow-downloads allow-storage-access-by-user-activation"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen; accelerometer; gyroscope; microphone; camera; cross-origin-isolated"
          allowFullScreen={videoControlsSettings.allowFullscreen}
          onLoad={() => {
            console.log('LandingPage: Iframe da Atomicat carregado com src URL');
          }}
          onError={(e) => {
            console.error('LandingPage: Erro no iframe da Atomicat URL:', e);
          }}
          style={{
            pointerEvents: videoControlsSettings.pointerEvents
          }}
        />
      );
    }

    // Para YouTube e uploads locais (sem mudanças)
    return (
      <iframe
        key={videoKey}
        className="absolute top-0 left-0 w-full h-full shadow-2xl"
        src={VideoService.generateVideoUrlWithControls(activeVideo.url, {
          ...activeVideo.video_controls,
          autoplay: false
        })}
        title={activeVideo.title}
        frameBorder="0"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen={videoControlsSettings.allowFullscreen}
        style={{
          pointerEvents: videoControlsSettings.pointerEvents
        }}
      />
    );
  };

  // Loading com fallback melhorado
  if (loading || !content) {
    console.log('LandingPage: Mostrando tela de loading');
    return (
      <div className={`min-h-screen hero-gradient flex items-center justify-center ${isMobile ? 'pb-16' : ''}`}>
        {isMobile ? <LandingPageMobileHeader /> : <Header />}
        
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-muted-foreground">Carregando...</p>
          {contentError && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-destructive">Erro: {contentError}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshContent}
              >
                Tentar Novamente
              </Button>
            </div>
          )}
        </div>
        
        {isMobile && <LandingPageBottomNav />}
      </div>
    );
  }

  console.log('LandingPage: Renderizando conteúdo principal - isMobile:', isMobile);

  return (
    <div className={`min-h-screen hero-gradient ${isMobile ? 'pb-16' : ''}`}>
      {/* Header Responsivo */}
      {isMobile ? <LandingPageMobileHeader /> : <Header />}
      
      {/* Hero Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="animate-fade-in">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight">
              <span className="text-foreground">{content.hero.title}</span>
              <br />
              <span className="text-premium">{content.hero.titleHighlight}</span>
            </h1>
            
            {/* Video Section */}
            {activeVideo && (
              <div className="mb-8">
                <div className="max-w-4xl mx-auto px-2">
                  <div className="relative w-full overflow-hidden rounded-xl" style={{ paddingBottom: '56.25%' }}>
                    {renderVideoPlayer()}

                    {videoControlsSettings.shouldShowOverlay && (
                      <div 
                        className="absolute inset-0"
                        style={{ pointerEvents: 'auto', background: 'transparent' }}
                        onContextMenu={videoControlsSettings.preventContextMenu ? (e) => e.preventDefault() : undefined}
                      />
                    )}
                  </div>
                  {activeVideo.description && (
                    <p className="text-center text-muted-foreground mt-4 max-w-2xl mx-auto text-sm md:text-base px-2">
                      {activeVideo.description}
                    </p>
                  )}
                </div>
              </div>
            )}
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed px-2">
              {content.hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-2">
              <Button 
                variant="premium" 
                size="lg" 
                onClick={() => navigate('/assinatura')}
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
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12 px-2">
            Por que escolher o <span className="text-premium">Drive Mental</span>?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 px-2">
            Campos de <span className="text-premium">Desenvolvimento</span>
          </h2>
          <p className="text-center text-muted-foreground mb-8 md:mb-12 text-base md:text-lg px-2 max-w-2xl mx-auto">
            Escolha sua área de foco e comece sua jornada de transformação
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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

      {/* Subscription Plans Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 px-2">
            Invista em seu <span className="text-premium">Desenvolvimento</span>
          </h2>
          <p className="text-center text-muted-foreground mb-8 md:mb-12 text-base md:text-lg px-2 max-w-2xl mx-auto">
            Escolha o plano ideal para sua transformação
          </p>
          <SubscriptionPlans />
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="card-gradient rounded-2xl p-6 md:p-12 max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 px-2">
              Pronto para transformar sua vida?
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 px-2 max-w-2xl mx-auto">
              Junte-se a milhares de pessoas que já transformaram suas vidas com o Drive Mental
            </p>
            <Button 
              variant="premium" 
              size="lg"
              onClick={() => navigate('/assinatura')}
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

      {/* Bottom Navigation Mobile */}
      {isMobile && <LandingPageBottomNav />}
    </div>
  );
}
