/**
 * Responsive Service - Utilitários para garantir responsividade consistente
 * Implementa SRP: responsável apenas por lógica de responsividade
 */

export interface ResponsiveConfig {
  container: {
    maxWidth: string;
    padding: string;
    mobilePadding: string;
  };
  grid: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
  spacing: {
    section: string;
    component: string;
  };
}

export class ResponsiveService {
  private static config: ResponsiveConfig = {
    container: {
      maxWidth: 'max-w-7xl',
      padding: 'px-4',
      mobilePadding: 'px-4'
    },
    grid: {
      mobile: 'grid-cols-1',
      tablet: 'md:grid-cols-2',
      desktop: 'lg:grid-cols-3'
    },
    spacing: {
      section: 'py-12 md:py-20',
      component: 'space-y-6 md:space-y-8'
    }
  };

  /**
   * Retorna classes de container responsivo padrão
   */
  static getContainerClasses(): string {
    return `${this.config.container.maxWidth} mx-auto ${this.config.container.padding}`;
  }

  /**
   * Retorna classes de grid responsivo
   */
  static getGridClasses(cols?: { mobile?: number; tablet?: number; desktop?: number }): string {
    const mobile = cols?.mobile || 1;
    const tablet = cols?.tablet || 2;
    const desktop = cols?.desktop || 3;
    
    return `grid grid-cols-${mobile} md:grid-cols-${tablet} lg:grid-cols-${desktop} gap-4 md:gap-6 lg:gap-8`;
  }

  /**
   * Retorna classes de espaçamento responsivo para seções
   */
  static getSectionSpacing(): string {
    return this.config.spacing.section;
  }

  /**
   * Retorna classes de espaçamento responsivo para componentes
   */
  static getComponentSpacing(): string {
    return this.config.spacing.component;
  }

  /**
   * Retorna classes de texto responsivo
   */
  static getTextClasses(size: 'sm' | 'md' | 'lg' | 'xl' | 'hero'): string {
    const sizes = {
      sm: 'text-sm md:text-base',
      md: 'text-base md:text-lg',
      lg: 'text-lg md:text-xl',
      xl: 'text-xl md:text-2xl lg:text-3xl',
      hero: 'text-3xl md:text-5xl lg:text-6xl xl:text-7xl'
    };
    
    return sizes[size];
  }

  /**
   * Retorna classes de card responsivo
   */
  static getCardClasses(): string {
    return 'w-full max-w-none md:max-w-lg lg:max-w-xl mx-auto';
  }

  /**
   * Retorna classes de botão responsivo
   */
  static getButtonClasses(fullWidth?: boolean): string {
    const base = 'w-full sm:w-auto';
    return fullWidth ? 'w-full' : base;
  }

  /**
   * Retorna classes de flex responsivo
   */
  static getFlexClasses(direction?: 'col' | 'row'): string {
    if (direction === 'col') {
      return 'flex flex-col gap-4';
    }
    return 'flex flex-col sm:flex-row gap-4 items-center justify-center';
  }

  /**
   * Valida se um elemento tem problemas de responsividade
   */
  static validateResponsiveness(element: HTMLElement): string[] {
    const issues: string[] = [];
    
    // Verifica overflow horizontal
    if (element.scrollWidth > element.clientWidth) {
      issues.push('Overflow horizontal detectado');
    }
    
    // Verifica largura fixa problemática
    const computedStyle = window.getComputedStyle(element);
    if (computedStyle.width && computedStyle.width.includes('px') && parseInt(computedStyle.width) > 768) {
      issues.push('Largura fixa muito grande para mobile');
    }
    
    return issues;
  }

  /**
   * Aplica correções automáticas de responsividade
   */
  static applyResponsiveFixes(element: HTMLElement): void {
    // Remove larguras fixas problemáticas
    element.style.maxWidth = '100%';
    element.style.width = 'auto';
    
    // Garante que não haja overflow
    element.style.overflowX = 'hidden';
    
    // Adiciona box-sizing se necessário
    element.style.boxSizing = 'border-box';
  }
}