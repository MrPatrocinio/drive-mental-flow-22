import { supabase } from '@/integrations/supabase/client';

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
    benefits: string[];
  };
  footer: {
    copyright: string;
  };
}

export class SupabaseContentService {
  static async getLandingPageContent(): Promise<LandingPageContent> {
    try {
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

      // Return with defaults if any section is missing
      return {
        hero: content.hero || {
          title: "Transforme Sua Mente Através da Repetição",
          subtitle: "Desenvolva todo seu potencial com áudios especializados em desenvolvimento pessoal. Reprogramação mental através de técnicas comprovadas.",
          ctaText: "Começar Agora",
          demoText: "Ver Demo"
        },
        features: content.features || [
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
        pricing: content.pricing || {
          price: 97,
          currency: "R$",
          benefits: [
            "Acesso a mais de 44 áudios exclusivos",
            "6 campos completos de desenvolvimento",
            "Player avançado com repetição automática",
            "Atualizações mensais de conteúdo",
            "Suporte prioritário",
            "Garantia de 30 dias"
          ]
        },
        footer: content.footer || {
          copyright: "© 2025 Drive Mental. Todos os direitos reservados."
        }
      };
    } catch (error) {
      console.error('Error fetching landing content:', error);
      // Return default content on error
      return this.getDefaultContent();
    }
  }

  static async saveLandingPageContent(content: LandingPageContent): Promise<void> {
    try {
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
    } catch (error) {
      console.error('Error saving landing content:', error);
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
        benefits: [
          "Acesso a mais de 44 áudios exclusivos",
          "6 campos completos de desenvolvimento",
          "Player avançado com repetição automática",
          "Atualizações mensais de conteúdo",
          "Suporte prioritário",
          "Garantia de 30 dias"
        ]
      },
      footer: {
        copyright: "© 2025 Drive Mental. Todos os direitos reservados."
      }
    };
  }
}