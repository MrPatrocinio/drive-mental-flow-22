export interface LandingPageContent {
  hero: {
    title: string;
    titleHighlight: string;
    subtitle: string;
    ctaText: string;
    demoText: string;
    videoUrl?: string;
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
    lgpdText: string;
    lgpdLink: string;
    privacyPolicyLink: string;
    termsOfServiceLink: string;
  };
}

export class ContentService {
  private static readonly CONTENT_KEY = "drive_mental_content";

  // Landing Page Content Management
  static getLandingPageContent(): LandingPageContent {
    const stored = localStorage.getItem(this.CONTENT_KEY);
    if (stored) {
      return JSON.parse(stored);
    }

    // Default content
    const defaultContent: LandingPageContent = {
      hero: {
        title: "Transforme Sua Mente",
        titleHighlight: "Instale Drives Mentais Poderosos",
        subtitle: "Desenvolva todo seu potencial com áudios especializados em desenvolvimento pessoal. Reprogramação mental através de técnicas comprovadas.",
        ctaText: "Começar Agora",
        demoText: "Ver Demo",
        videoUrl: ""
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
        copyright: "© 2025 Drive Mental. Todos os direitos reservados.",
        lgpdText: "Seus dados estão protegidos conforme a LGPD",
        lgpdLink: "/lgpd",
        privacyPolicyLink: "/politica-privacidade",
        termsOfServiceLink: "/termos-uso"
      }
    };

    this.saveLandingPageContent(defaultContent);
    return defaultContent;
  }

  static saveLandingPageContent(content: LandingPageContent): void {
    localStorage.setItem(this.CONTENT_KEY, JSON.stringify(content));
  }
}