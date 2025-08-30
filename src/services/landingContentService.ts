
/**
 * Landing Content Service
 * Responsabilidade: Gerenciar conteúdo da landing page (princípio SRP)
 * Princípio SSOT: Fonte única da verdade para conteúdo da landing
 * Princípio DRY: Evita duplicação entre ContentService e SupabaseContentService
 */

import { supabase } from '@/integrations/supabase/client';
import { syncDiagnostics } from './syncDiagnostics';

export interface LandingPageContent {
  hero: {
    title: string;
    titleHighlight: string;
    subtitle: string;
    ctaText: string;
    demoText: string;
  };
  features: Array<{
    id: string;
    icon: string;
    title: string;
    description: string;
  }>;
  footer: {
    copyright: string;
    lgpdText: string;
    lgpdLink: string;
    privacyPolicyLink: string;
    termsOfServiceLink: string;
  };
}

class LandingContentServiceClass {
  private static instance: LandingContentServiceClass | null = null;
  private cache: LandingPageContent | null = null;
  private lastUpdated: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  private constructor() {}

  static getInstance(): LandingContentServiceClass {
    if (!LandingContentServiceClass.instance) {
      LandingContentServiceClass.instance = new LandingContentServiceClass();
    }
    return LandingContentServiceClass.instance;
  }

  async getLandingPageContent(forceRefresh = false): Promise<LandingPageContent> {
    const now = Date.now();
    
    // Usar cache se válido e não forçar refresh
    if (!forceRefresh && this.cache && (now - this.lastUpdated) < this.CACHE_DURATION) {
      syncDiagnostics.log('cache_hit', 'success', { age: now - this.lastUpdated });
      return this.cache;
    }

    try {
      syncDiagnostics.log('loading_landing_content', 'success');
      
      const { data, error } = await supabase
        .from('landing_content')
        .select('content')
        .eq('section', 'landing_page')
        .maybeSingle();

      if (error) {
        syncDiagnostics.log('supabase_error', 'error', error);
        // Retornar cache se houver erro e cache existir
        if (this.cache) {
          syncDiagnostics.log('fallback_to_cache', 'warning');
          return this.cache;
        }
        return this.getDefaultContent();
      }

      if (data?.content) {
        const content = data.content as unknown as LandingPageContent;
        if (this.isValidContent(content)) {
          this.cache = content;
          this.lastUpdated = now;
          syncDiagnostics.log('content_loaded_successfully', 'success');
          return content;
        }
      }

      syncDiagnostics.log('invalid_content_structure', 'warning');
      return this.getDefaultContent();
    } catch (error) {
      syncDiagnostics.log('unexpected_error', 'error', error);
      // Retornar cache ou default
      return this.cache || this.getDefaultContent();
    }
  }

  async saveLandingPageContent(content: LandingPageContent): Promise<void> {
    try {
      syncDiagnostics.log('saving_landing_content', 'success');
      
      const { error } = await supabase
        .from('landing_content')
        .upsert({
          section: 'landing_page',
          content: content as any,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'section'
        });

      if (error) {
        syncDiagnostics.log('save_error', 'error', error);
        throw error;
      }

      // Atualizar cache imediatamente
      this.cache = content;
      this.lastUpdated = Date.now();
      
      syncDiagnostics.log('content_saved_successfully', 'success');
    } catch (error) {
      syncDiagnostics.log('save_failed', 'error', error);
      throw error;
    }
  }

  invalidateCache(): void {
    syncDiagnostics.log('cache_invalidated', 'success');
    this.cache = null;
    this.lastUpdated = 0;
  }

  private isValidContent(content: any): content is LandingPageContent {
    return (
      content &&
      content.hero &&
      content.features &&
      Array.isArray(content.features) &&
      content.footer
    );
  }

  private getDefaultContent(): LandingPageContent {
    syncDiagnostics.log('using_default_content', 'warning');
    return {
      hero: {
        title: "Transforme sua mente e conquiste",
        titleHighlight: "seus objetivos mais ambiciosos",
        subtitle: "Desbloqueie todo o seu potencial com áudios de programação mental cientificamente desenvolvidos. Alcance o sucesso, a abundância e a realização pessoal que você sempre desejou.",
        ctaText: "Começar Agora",
        demoText: "Ver Demo"
      },
      features: [
        {
          id: "feature-1",
          icon: "Brain",
          title: "Programação Mental Avançada",
          description: "Áudios desenvolvidos com técnicas neurocientíficas para reprogramar padrões mentais limitantes"
        },
        {
          id: "feature-2",
          icon: "Target",
          title: "Resultados Comprovados",
          description: "Método testado e aprovado por milhares de pessoas que transformaram suas vidas"
        },
        {
          id: "feature-3",
          icon: "Clock",
          title: "Apenas 20 Minutos por Dia",
          description: "Transformação real com apenas alguns minutos de dedicação diária"
        },
        {
          id: "feature-4",
          icon: "Shield",
          title: "100% Seguro e Natural",
          description: "Técnicas naturais sem efeitos colaterais, baseadas em neurociência"
        }
      ],
      footer: {
        copyright: "© 2024 Drive Mental. Todos os direitos reservados.",
        lgpdText: "Este site está em conformidade com a LGPD",
        lgpdLink: "/lgpd",
        privacyPolicyLink: "/privacy",
        termsOfServiceLink: "/terms"
      }
    };
  }
}

export const landingContentService = LandingContentServiceClass.getInstance();
