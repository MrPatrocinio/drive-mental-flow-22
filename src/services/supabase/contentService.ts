
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

export class SupabaseContentService {
  private static readonly LANDING_PAGE_SECTION = 'landing_page';

  static async getLandingPageContent(): Promise<LandingPageContent> {
    console.log('SupabaseContentService: Buscando conteúdo da landing page');
    
    try {
      const { data, error } = await supabase
        .from('landing_content')
        .select('content')
        .eq('section', this.LANDING_PAGE_SECTION)
        .maybeSingle();

      if (error) {
        console.error('SupabaseContentService: Erro ao buscar conteúdo:', error);
        throw error;
      }

      if (!data) {
        console.log('SupabaseContentService: Nenhum conteúdo encontrado, retornando dados padrão');
        return this.getDefaultLandingContent();
      }

      console.log('SupabaseContentService: Conteúdo encontrado');
      return data.content as LandingPageContent;
    } catch (error) {
      console.error('SupabaseContentService: Erro geral:', error);
      return this.getDefaultLandingContent();
    }
  }

  static async saveLandingPageContent(content: LandingPageContent): Promise<void> {
    console.log('SupabaseContentService: Salvando conteúdo da landing page');
    
    try {
      const { error } = await supabase
        .from('landing_content')
        .upsert({
          section: this.LANDING_PAGE_SECTION,
          content: content as any,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'section'
        });

      if (error) {
        console.error('SupabaseContentService: Erro ao salvar conteúdo:', error);
        throw error;
      }

      console.log('SupabaseContentService: Conteúdo salvo com sucesso');
      
      // Notificar mudança via DataSync
      this.notifyContentChange(content);
    } catch (error) {
      console.error('SupabaseContentService: Erro geral ao salvar:', error);
      throw error;
    }
  }

  private static notifyContentChange(content: LandingPageContent): void {
    import('@/services/dataSync').then(({ DataSyncService }) => {
      DataSyncService.forceNotification('content_changed', { 
        event: 'UPDATE', 
        new: { landing_page: content } 
      });
    }).catch(error => {
      console.warn('SupabaseContentService: Erro ao notificar mudança:', error);
    });
  }

  private static getDefaultLandingContent(): LandingPageContent {
    return {
      hero: {
        title: "Transforme sua mente e conquiste",
        titleHighlight: "seus objetivos mais ambiciosos",
        subtitle: "Com áudios de programação mental baseados em neurociência, você desenvolve novos padrões mentais em apenas 21 dias. Reprograme sua mente para o sucesso, abundância e realização pessoal.",
        ctaText: "Começar Transformação",
        demoText: "Ver Demonstração"
      },
      features: [
        {
          id: "1",
          icon: "Brain",
          title: "Programação Mental Científica",
          description: "Áudios desenvolvidos com base em neurociência para reprogramar padrões mentais limitantes"
        },
        {
          id: "2", 
          icon: "Target",
          title: "Resultados em 21 Dias",
          description: "Metodologia comprovada que gera mudanças reais em apenas 3 semanas de prática consistente"
        },
        {
          id: "3",
          icon: "Heart",
          title: "Transformação Completa",
          description: "Desenvolva mindset de abundância, autoconfiança e foco para alcançar seus objetivos"
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
