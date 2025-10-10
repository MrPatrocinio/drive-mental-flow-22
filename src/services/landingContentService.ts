
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
  whatIsDriveMental: {
    enabled: boolean;
    title: string;
    subtitle: string;
    benefits: Array<{
      id: string;
      icon: string;
      title: string;
      description: string;
    }>;
    scientificNote: string;
  };
  comoFunciona: {
    enabled: boolean;
    title: string;
    subtitle: string;
    steps: Array<{
      id: string;
      icon: string;
      title: string;
      description: string;
    }>;
    finalNote: string;
  };
  features: Array<{
    id: string;
    icon: string;
    title: string;
    description: string;
  }>;
  priceComparison: {
    enabled: boolean;
    title: string;
    subtitle: string;
    options: Array<{
      id: string;
      icon: string;
      title: string;
      frequency: string;
      pricePerYear: string;
      isHighlight: boolean;
      badge?: string;
    }>;
    impactText: string;
    ctaButton: {
      text: string;
      scrollToSection: string;
    };
  };
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
      typeof content === 'object' &&
      content.hero &&
      typeof content.hero === 'object' &&
      content.whatIsDriveMental &&
      typeof content.whatIsDriveMental === 'object' &&
      content.comoFunciona &&
      typeof content.comoFunciona === 'object' &&
      Array.isArray(content.features) &&
      content.priceComparison &&
      typeof content.priceComparison === 'object' &&
      Array.isArray(content.priceComparison.options) &&
      content.footer &&
      typeof content.footer === 'object'
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
      whatIsDriveMental: {
        enabled: true,
        title: "🧬 O que é o Drive Mental",
        subtitle: "O **Drive Mental** é um **aplicativo web de reprogramação mental** que usa **áudios curtos e guiados**, aliados a **rotinas mentais práticas**, para ajudar você a:",
        benefits: [
          {
            id: "benefit-1",
            icon: "RefreshCw",
            title: "Quebrar ciclos de autossabotagem",
            description: "Identifique e elimine padrões mentais que impedem seu crescimento"
          },
          {
            id: "benefit-2",
            icon: "Target",
            title: "Aumentar o foco e a autoconfiança",
            description: "Desenvolva concentração inabalável e confiança genuína"
          },
          {
            id: "benefit-3",
            icon: "TrendingUp",
            title: "Desenvolver um mindset de prosperidade",
            description: "Cultive mentalidade de crescimento e abundância"
          },
          {
            id: "benefit-4",
            icon: "Zap",
            title: "Transformar hábitos limitantes",
            description: "Substitua comportamentos negativos por novos padrões positivos"
          }
        ],
        scientificNote: "🧠 <em>Tudo com base em estudos reais de neuroplasticidade e psicologia cognitiva.</em> Nada de promessas mágicas — apenas <strong>repetição, consistência e ciência aplicada.</strong>"
      },
      comoFunciona: {
        enabled: true,
        title: "🔬 Como Funciona",
        subtitle: "Siga o passo a passo simples e descubra como o Drive Mental transforma seu modo de pensar em poucos minutos por dia:",
        steps: [
          {
            id: "step-1",
            icon: "Target",
            title: "Escolha sua área de foco",
            description: "Exemplo: Prosperidade, Foco, Liderança, Autoestima..."
          },
          {
            id: "step-2",
            icon: "Headphones",
            title: "Ouça 1 áudio por dia",
            description: "Reserve um momento tranquilo e concentre-se totalmente na experiência."
          },
          {
            id: "step-3",
            icon: "Brain",
            title: "Aplique o exercício mental prático",
            description: "Após cada áudio, pratique o exercício proposto para reforçar o aprendizado."
          },
          {
            id: "step-4",
            icon: "TrendingUp",
            title: "Acompanhe sua evolução semanal",
            description: "Veja gráficos e insights personalizados que mostram seu progresso."
          }
        ],
        finalNote: "🕒 <em>Em apenas 21 dias, seu cérebro começa a consolidar novos caminhos neurais — um novo \"drive mental\" de alta performance.</em>"
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
      priceComparison: {
        enabled: true,
        title: "O valor de uma mente saudável não precisa custar tão caro",
        subtitle: "Veja a comparação real entre os valores de sessões tradicionais e o Drive Mental",
        options: [
          {
            id: "option-1",
            icon: "Users",
            title: "Psicólogo Iniciante (R$ 150/sessão)",
            frequency: "1x por semana",
            pricePerYear: "R$ 7.200,00/ano",
            isHighlight: false
          },
          {
            id: "option-2",
            icon: "Users",
            title: "Psicólogo Especialista (R$ 250/sessão)",
            frequency: "1x por semana",
            pricePerYear: "R$ 12.000,00/ano",
            isHighlight: false
          },
          {
            id: "option-3",
            icon: "Award",
            title: "Psicanalista/Terapeuta (R$ 300/sessão)",
            frequency: "1x por semana",
            pricePerYear: "R$ 14.400,00/ano",
            isHighlight: false
          },
          {
            id: "option-4",
            icon: "Sparkles",
            title: "🚀 Drive Mental",
            frequency: "Acesso diário e ilimitado",
            pricePerYear: "R$ 358,80/ano",
            isHighlight: true,
            badge: "Plano Anual"
          }
        ],
        impactText: "Pelo preço de apenas <span class=\"text-premium\">1 sessão de terapia</span>, você tem <span class=\"text-premium\">12 meses inteiros</span> de reprogramação mental diária e ILIMITADA com o Drive Mental.",
        ctaButton: {
          text: "EU QUERO!!!",
          scrollToSection: "subscription-plans"
        }
      },
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
