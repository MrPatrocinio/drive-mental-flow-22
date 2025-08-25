
/**
 * LandingPageMobileHeader - Header mobile para landing page
 * Responsabilidade: Apenas exibir logo no topo (princípio SRP)
 * Princípio KISS: Interface limpa apenas com logo
 */

import { Logo } from "@/components/Logo";

export const LandingPageMobileHeader = () => {
  return (
    <header className="border-b border-border/50 bg-card/30 backdrop-blur-md sticky top-0 z-50 w-full block md:hidden">
      <div className="container mx-auto px-4 h-14 flex items-center justify-center">
        <Logo size="sm" />
      </div>
    </header>
  );
};
