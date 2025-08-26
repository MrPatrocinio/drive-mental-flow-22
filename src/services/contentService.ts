
/**
 * @deprecated Este serviço está sendo substituído pelo landingContentService
 * Use landingContentService para nova funcionalidade
 * Mantido apenas para compatibilidade com código legado
 */

import { PricingInfo } from "./supabase/pricingService";
import { landingContentService, LandingPageContent } from "./landingContentService";

// Redirecionar para o novo serviço
class ContentServiceClass {
  async getLandingPageContent(): Promise<LandingPageContent> {
    console.warn('ContentService is deprecated. Use landingContentService instead.');
    return landingContentService.getLandingPageContent();
  }

  saveLandingPageContent(content: LandingPageContent): void {
    console.warn('ContentService is deprecated. Use landingContentService instead.');
    // Não fazer nada aqui, pois o novo serviço é assíncrono
  }
}

export const ContentService = new ContentServiceClass();
export type { LandingPageContent };
