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
  LucideIcon,
  // Novos ícones para bem-estar
  Smile,
  Activity,
  Apple,
  Leaf,
  Sun,
  Moon,
  Flower2,
  // Novos ícones para espiritualidade
  Feather,
  Cloud,
  TreePine,
  Sunrise,
  Infinity,
  // Novos ícones para desenvolvimento
  Eye,
  Compass,
  Key,
  Diamond,
  Telescope,
  // Novos ícones para relacionamentos
  Handshake,
  MessageCircle,
  UserCheck,
  Users2,
  // Novos ícones para produtividade
  Briefcase,
  Clock,
  CheckCircle,
  BarChart,
  Settings,
  Calendar,
  // Novos ícones emocionais
  Droplets,
  // Outros ícones úteis
  Anchor,
  Award,
  Bookmark,
  Flame,
  Focus,
  Gem,
  Magnet,
  Orbit,
  Route,
  Stethoscope,
  Timer,
  Wand2,
  Flower,
  TreeDeciduous,
  Wheat,
  Snowflake
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
    { name: 'Activity', component: Activity, label: 'Atividade' },
    { name: 'Anchor', component: Anchor, label: 'Âncora' },
    { name: 'Apple', component: Apple, label: 'Maçã' },
    { name: 'Award', component: Award, label: 'Prêmio' },
    { name: 'BarChart', component: BarChart, label: 'Gráfico' },
    { name: 'Book', component: Book, label: 'Livro' },
    { name: 'Bookmark', component: Bookmark, label: 'Marcador' },
    { name: 'Brain', component: Brain, label: 'Cérebro' },
    { name: 'Briefcase', component: Briefcase, label: 'Maleta' },
    { name: 'Calendar', component: Calendar, label: 'Calendário' },
    { name: 'Camera', component: Camera, label: 'Câmera' },
    { name: 'CheckCircle', component: CheckCircle, label: 'Concluído' },
    { name: 'Clock', component: Clock, label: 'Relógio' },
    { name: 'Cloud', component: Cloud, label: 'Nuvem' },
    { name: 'Code', component: Code, label: 'Código' },
    { name: 'Coffee', component: Coffee, label: 'Café' },
    { name: 'Compass', component: Compass, label: 'Bússola' },
    { name: 'Crown', component: Crown, label: 'Coroa' },
    { name: 'Diamond', component: Diamond, label: 'Diamante' },
    { name: 'Droplets', component: Droplets, label: 'Gotas' },
    { name: 'Eye', component: Eye, label: 'Olho' },
    { name: 'Feather', component: Feather, label: 'Pena' },
    { name: 'Flame', component: Flame, label: 'Chama' },
    { name: 'Flower', component: Flower, label: 'Flor' },
    { name: 'Flower2', component: Flower2, label: 'Flor 2' },
    { name: 'Focus', component: Focus, label: 'Foco' },
    { name: 'Gamepad2', component: Gamepad2, label: 'Controle' },
    { name: 'Gem', component: Gem, label: 'Gema' },
    { name: 'Gift', component: Gift, label: 'Presente' },
    { name: 'Globe', component: Globe, label: 'Globo' },
    { name: 'Handshake', component: Handshake, label: 'Aperto de Mão' },
    { name: 'Headphones', component: Headphones, label: 'Fones' },
    { name: 'Heart', component: Heart, label: 'Coração' },
    { name: 'Home', component: Home, label: 'Casa' },
    { name: 'Infinity', component: Infinity, label: 'Infinito' },
    { name: 'Key', component: Key, label: 'Chave' },
    { name: 'Leaf', component: Leaf, label: 'Folha' },
    { name: 'Lightbulb', component: Lightbulb, label: 'Lâmpada' },
    { name: 'Magnet', component: Magnet, label: 'Ímã' },
    { name: 'Medal', component: Medal, label: 'Medalha' },
    { name: 'MessageCircle', component: MessageCircle, label: 'Mensagem' },
    { name: 'Moon', component: Moon, label: 'Lua' },
    { name: 'Mountain', component: Mountain, label: 'Montanha' },
    { name: 'Music', component: Music, label: 'Música' },
    { name: 'Orbit', component: Orbit, label: 'Órbita' },
    { name: 'Palette', component: Palette, label: 'Paleta' },
    { name: 'Puzzle', component: Puzzle, label: 'Quebra-cabeça' },
    { name: 'Rocket', component: Rocket, label: 'Foguete' },
    { name: 'Route', component: Route, label: 'Rota' },
    { name: 'Settings', component: Settings, label: 'Configurações' },
    { name: 'Shield', component: Shield, label: 'Escudo' },
    { name: 'Smile', component: Smile, label: 'Sorriso' },
    { name: 'Snowflake', component: Snowflake, label: 'Floco de Neve' },
    { name: 'Sparkles', component: Sparkles, label: 'Brilhos' },
    { name: 'Star', component: Star, label: 'Estrela' },
    { name: 'Stethoscope', component: Stethoscope, label: 'Estetoscópio' },
    { name: 'Sun', component: Sun, label: 'Sol' },
    { name: 'Sunrise', component: Sunrise, label: 'Nascer do Sol' },
    { name: 'Target', component: Target, label: 'Alvo' },
    { name: 'Telescope', component: Telescope, label: 'Telescópio' },
    { name: 'Timer', component: Timer, label: 'Cronômetro' },
    { name: 'TreeDeciduous', component: TreeDeciduous, label: 'Árvore' },
    { name: 'TreePine', component: TreePine, label: 'Pinheiro' },
    { name: 'TrendingUp', component: TrendingUp, label: 'Crescimento' },
    { name: 'Trophy', component: Trophy, label: 'Troféu' },
    { name: 'UserCheck', component: UserCheck, label: 'Usuário Verificado' },
    { name: 'Users', component: Users, label: 'Pessoas' },
    { name: 'Users2', component: Users2, label: 'Grupo' },
    { name: 'Wallet', component: Wallet, label: 'Carteira' },
    { name: 'Wand2', component: Wand2, label: 'Varinha Mágica' },
    { name: 'Waves', component: Waves, label: 'Ondas' },
    { name: 'Wheat', component: Wheat, label: 'Trigo' },
    { name: 'Wind', component: Wind, label: 'Vento' },
    { name: 'Zap', component: Zap, label: 'Raio' }
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