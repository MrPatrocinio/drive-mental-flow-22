
import { supabase } from '@/integrations/supabase/client';

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

class SupabaseContentServiceClass {
  async getLandingPageContent(): Promise<LandingPageContent> {
    try {
      const { data, error } = await supabase
        .from('landing_content')
        .select('content')
        .eq('id', 'landing_page')
        .single();

      if (error) {
        console.warn('Erro ao buscar conteúdo da landing page:', error);
        return this.getDefaultContent();
      }

      if (data?.content) {
        // Validate that the content has the expected structure
        const content = data.content as unknown as LandingPageContent;
        if (content.hero && content.features && content.footer) {
          return content;
        }
      }

      return this.getDefaultContent();
    } catch (error) {
      console.error('Erro ao carregar conteúdo da landing page:', error);
      return this.getDefaultContent();
    }
  }

  async saveLandingPageContent(content: LandingPageContent): Promise<void> {
    try {
      const { error } = await supabase
        .from('landing_content')
        .upsert({
          id: 'landing_page',
          section: 'landing_page',
          content: content as any,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao salvar conteúdo da landing page:', error);
      throw error;
    }
  }

  private getDefaultContent(): LandingPageContent {
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

export const SupabaseContentService = new SupabaseContentServiceClass();
