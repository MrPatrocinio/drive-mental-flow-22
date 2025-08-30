import {
  Brain,
  Heart,
  Target,
  Lightbulb,
  Users,
  TrendingUp,
  Shield,
  Star,
  Zap,
  Crown,
  Gift,
  Rocket,
  Globe,
  Book,
  Music,
  Palette,
  Camera,
  Code,
  Coffee,
  Gamepad2,
  Headphones,
  Home,
  Medal,
  Mountain,
  Puzzle,
  Sparkles,
  Trophy,
  Wallet,
  Waves,
  Wind,
  LucideIcon
} from 'lucide-react';

export interface IconOption {
  name: string;
  component: LucideIcon;
  label: string;
}

/**
 * Serviço responsável por gerenciar os ícones disponíveis no sistema
 * Seguindo o princípio SRP - única responsabilidade de gerenciar ícones
 */
export class IconService {
  private static readonly availableIcons: IconOption[] = [
    { name: 'Brain', component: Brain, label: 'Cérebro' },
    { name: 'Heart', component: Heart, label: 'Coração' },
    { name: 'Target', component: Target, label: 'Alvo' },
    { name: 'Lightbulb', component: Lightbulb, label: 'Lâmpada' },
    { name: 'Users', component: Users, label: 'Pessoas' },
    { name: 'TrendingUp', component: TrendingUp, label: 'Crescimento' },
    { name: 'Shield', component: Shield, label: 'Escudo' },
    { name: 'Star', component: Star, label: 'Estrela' },
    { name: 'Zap', component: Zap, label: 'Raio' },
    { name: 'Crown', component: Crown, label: 'Coroa' },
    { name: 'Gift', component: Gift, label: 'Presente' },
    { name: 'Rocket', component: Rocket, label: 'Foguete' },
    { name: 'Globe', component: Globe, label: 'Globo' },
    { name: 'Book', component: Book, label: 'Livro' },
    { name: 'Music', component: Music, label: 'Música' },
    { name: 'Palette', component: Palette, label: 'Paleta' },
    { name: 'Camera', component: Camera, label: 'Câmera' },
    { name: 'Code', component: Code, label: 'Código' },
    { name: 'Coffee', component: Coffee, label: 'Café' },
    { name: 'Gamepad2', component: Gamepad2, label: 'Controle' },
    { name: 'Headphones', component: Headphones, label: 'Fones' },
    { name: 'Home', component: Home, label: 'Casa' },
    { name: 'Medal', component: Medal, label: 'Medalha' },
    { name: 'Mountain', component: Mountain, label: 'Montanha' },
    { name: 'Puzzle', component: Puzzle, label: 'Quebra-cabeça' },
    { name: 'Sparkles', component: Sparkles, label: 'Brilhos' },
    { name: 'Trophy', component: Trophy, label: 'Troféu' },
    { name: 'Wallet', component: Wallet, label: 'Carteira' },
    { name: 'Waves', component: Waves, label: 'Ondas' },
    { name: 'Wind', component: Wind, label: 'Vento' }
  ];

  /**
   * Retorna todos os ícones disponíveis
   * Fonte única da verdade para ícones (SSOT)
   */
  static getAvailableIcons(): IconOption[] {
    return this.availableIcons;
  }

  /**
   * Busca um ícone pelo nome
   */
  static getIconByName(name: string): IconOption | undefined {
    return this.availableIcons.find(icon => icon.name === name);
  }

  /**
   * Retorna o componente do ícone pelo nome
   */
  static getIconComponent(name: string): LucideIcon {
    const icon = this.getIconByName(name);
    return icon?.component || Brain; // Fallback para Brain
  }
}