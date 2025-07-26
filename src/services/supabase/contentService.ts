
import { supabase } from '@/integrations/supabase/client';
import { RealtimeService } from '@/services/realtimeService';

export interface LandingPageContent {
  hero: {
    title: string;
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
  pricing: {
    price: number;
    currency: string;
    payment_type: string;
    access_type: string;
    benefits: string[];
    button_text: string;
  };
  footer: {
    copyright: string;
  };
}

export class SupabaseContentService {
  static async getLandingPageContent(): Promise<LandingPageContent> {
    try {
      console.log('SupabaseContentService: Buscando conteúdo da landing page');
      const { data, error } = await supabase
        .from('landing_content')
        .select('*');

      if (error) throw error;

      // Convert array of sections to content object
      const content: Partial<LandingPageContent> = {};
      
      data.forEach(item => {
        if (item.section === 'hero') {
          content.hero = item.content as LandingPageContent['hero'];
        } else if (item.section === 'features') {
          content.features = item.content as LandingPageContent['features'];
        } else if (item.section === 'pricing') {
          content.pricing = item.content as LandingPageContent['pricing'];
        } else if (item.section === 'footer') {
          content.footer = item.content as LandingPageContent['footer'];
        }
      });

      const finalContent = {
        hero: content.hero || this.getDefaultContent().hero,
        features: content.features || this.getDefaultContent().features,
        pricing: content.pricing || this.getDefaultContent().pricing,
        footer: content.footer || this.getDefaultContent().footer
      };

      console.log('SupabaseContentService: Conteúdo carregado com sucesso');
      return finalContent;
    } catch (error) {
      console.error('SupabaseContentService: Erro ao buscar conteúdo:', error);
      return this.getDefaultContent();
    }
  }

  static async saveLandingPageContent(content: LandingPageContent): Promise<void> {
    try {
      console.log('SupabaseContentService: Salvando conteúdo da landing page');
      
      // Upsert each section separately
      const sections = [
        { section: 'hero', content: content.hero },
        { section: 'features', content: content.features },
        { section: 'pricing', content: content.pricing },
        { section: 'footer', content: content.footer }
      ];

      for (const section of sections) {
        const { error } = await supabase
          .from('landing_content')
          .upsert(section, { 
            onConflict: 'section',
            ignoreDuplicates: false 
          });

        if (error) throw error;
      }

      console.log('SupabaseContentService: Conteúdo salvo com sucesso');
      
      // Notificar sistema de tempo real
      setTimeout(() => {
        RealtimeService.forceRefresh();
      }, 100);
    } catch (error) {
      console.error('SupabaseContentService: Erro ao salvar conteúdo:', error);
      throw error;
    }
  }

  private static getDefaultContent(): LandingPageContent {
    return {
      hero: {
        title: "Transforme Sua Mente Através da Repetição",
        subtitle: "Desenvolva todo seu potencial com áudios especializados em desenvolvimento pessoal. Reprogramação mental através de técnicas comprovadas.",
        ctaText: "Começar Agora",
        demoText: "Ver Demo"
      },
      features: [
        {
          id: "f1",
          icon: "Brain",
          title: "Desenvolvimento Mental",
          description: "Técnicas avançadas de programação mental através de repetição auditiva"
        },
        {
          id: "f2",
          icon: "Users",
          title: "Comunidade Exclusiva",
          description: "Acesso a uma comunidade de pessoas focadas em crescimento pessoal"
        },
        {
          id: "f3",
          icon: "Award",
          title: "Resultados Comprovados",
          description: "Metodologia testada e aprovada por milhares de usuários"
        }
      ],
      pricing: {
        price: 97,
        currency: "R$",
        payment_type: "Pagamento único",
        access_type: "Acesso vitalício",
        benefits: [
          "Acesso completo aos áudios especializados",
          "Suporte especializado 24/7",
          "Atualizações constantes de conteúdo"
        ],
        button_text: "Começar Agora"
      },
      footer: {
        copyright: "© 2025 Drive Mental. Todos os direitos reservados."
      }
    };
  }
}
