
import { PricingInfo } from "./supabase/pricingService";

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

class ContentServiceClass {
  private landingPageContent: LandingPageContent;

  constructor() {
    // Initialize with default content
    this.landingPageContent = this.getDefaultLandingPageContent();
  }

  getLandingPageContent(): LandingPageContent {
    return this.landingPageContent;
  }

  saveLandingPageContent(content: LandingPageContent): void {
    this.landingPageContent = content;
  }

  private getDefaultLandingPageContent(): LandingPageContent {
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

export const ContentService = new ContentServiceClass();
