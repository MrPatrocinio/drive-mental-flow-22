import { Heart, Brain, Target, DollarSign, Activity, Sparkles, LucideIcon } from "lucide-react";

export interface Audio {
  id: string;
  title: string;
  duration: string;
  url: string;
  description: string;
}

export interface Field {
  id: string;
  title: string;
  icon: LucideIcon;
  audioCount: number;
  description: string;
  audios: Audio[];
}

// Mock audio URLs - Em produção, estes seriam URLs reais
const mockAudioUrl = "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav";

export const fields: Field[] = [
  {
    id: "emocional",
    title: "Emocional",
    icon: Heart,
    audioCount: 8,
    description: "Desenvolva sua inteligência emocional e bem-estar mental",
    audios: [
      {
        id: "em1",
        title: "Controle da Ansiedade",
        duration: "12:30",
        url: mockAudioUrl,
        description: "Técnicas para gerenciar e reduzir a ansiedade no dia a dia"
      },
      {
        id: "em2",
        title: "Autoconfiança",
        duration: "15:45",
        url: mockAudioUrl,
        description: "Desenvolva uma autoestima sólida e duradoura"
      },
      {
        id: "em3",
        title: "Gestão do Estresse",
        duration: "10:20",
        url: mockAudioUrl,
        description: "Aprenda a lidar com situações estressantes de forma equilibrada"
      },
      {
        id: "em4",
        title: "Inteligência Emocional",
        duration: "18:10",
        url: mockAudioUrl,
        description: "Desenvolva sua capacidade de compreender e gerenciar emoções"
      },
      {
        id: "em5",
        title: "Superação de Traumas",
        duration: "20:15",
        url: mockAudioUrl,
        description: "Técnicas para processar e superar experiências traumáticas"
      },
      {
        id: "em6",
        title: "Autoestima",
        duration: "14:30",
        url: mockAudioUrl,
        description: "Construa uma imagem positiva e realista de si mesmo"
      },
      {
        id: "em7",
        title: "Resiliência Mental",
        duration: "16:40",
        url: mockAudioUrl,
        description: "Desenvolva sua capacidade de se recuperar de adversidades"
      },
      {
        id: "em8",
        title: "Equilíbrio Emocional",
        duration: "13:25",
        url: mockAudioUrl,
        description: "Mantenha suas emoções equilibradas em todas as situações"
      }
    ]
  },
  {
    id: "amor",
    title: "Amor",
    icon: Heart,
    audioCount: 6,
    description: "Transforme seus relacionamentos e atraia o amor verdadeiro",
    audios: [
      {
        id: "am1",
        title: "Relacionamentos Saudáveis",
        duration: "17:20",
        url: mockAudioUrl,
        description: "Construa relacionamentos baseados em respeito e compreensão"
      },
      {
        id: "am2",
        title: "Autoamor",
        duration: "14:15",
        url: mockAudioUrl,
        description: "Aprenda a se amar e valorizar antes de amar outros"
      },
      {
        id: "am3",
        title: "Comunicação no Relacionamento",
        duration: "19:30",
        url: mockAudioUrl,
        description: "Melhore a comunicação com seu parceiro ou parceira"
      },
      {
        id: "am4",
        title: "Superação de Términos",
        duration: "16:45",
        url: mockAudioUrl,
        description: "Processe o fim de relacionamentos de forma saudável"
      },
      {
        id: "am5",
        title: "Atração Consciente",
        duration: "15:50",
        url: mockAudioUrl,
        description: "Atraia pessoas alinhadas com seus valores e objetivos"
      },
      {
        id: "am6",
        title: "Intimidade e Conexão",
        duration: "18:35",
        url: mockAudioUrl,
        description: "Desenvolva intimidade emocional e física em seus relacionamentos"
      }
    ]
  },
  {
    id: "autodominio",
    title: "Autodomínio",
    icon: Target,
    audioCount: 7,
    description: "Desenvolva disciplina e controle sobre seus hábitos e impulsos",
    audios: [
      {
        id: "ad1",
        title: "Disciplina Mental",
        duration: "16:20",
        url: mockAudioUrl,
        description: "Fortaleça sua capacidade de manter foco e disciplina"
      },
      {
        id: "ad2",
        title: "Controle de Impulsos",
        duration: "14:40",
        url: mockAudioUrl,
        description: "Aprenda a controlar impulsos destrutivos e reações automáticas"
      },
      {
        id: "ad3",
        title: "Força de Vontade",
        duration: "18:15",
        url: mockAudioUrl,
        description: "Desenvolva uma força de vontade inabalável"
      },
      {
        id: "ad4",
        title: "Hábitos Produtivos",
        duration: "15:30",
        url: mockAudioUrl,
        description: "Crie e mantenha hábitos que impulsionam seu crescimento"
      },
      {
        id: "ad5",
        title: "Autocontrole",
        duration: "17:50",
        url: mockAudioUrl,
        description: "Domine suas reações e comportamentos em todas as situações"
      },
      {
        id: "ad6",
        title: "Persistência",
        duration: "13:25",
        url: mockAudioUrl,
        description: "Desenvolva a capacidade de persistir diante de obstáculos"
      },
      {
        id: "ad7",
        title: "Autodomínio Emocional",
        duration: "19:10",
        url: mockAudioUrl,
        description: "Controle suas emoções sem reprimi-las de forma saudável"
      }
    ]
  },
  {
    id: "prosperidade",
    title: "Prosperidade",
    icon: DollarSign,
    audioCount: 9,
    description: "Desenvolva uma mentalidade próspera e atraia abundância",
    audios: [
      {
        id: "pr1",
        title: "Mentalidade de Abundância",
        duration: "20:15",
        url: mockAudioUrl,
        description: "Transforme sua relação com o dinheiro e a abundância"
      },
      {
        id: "pr2",
        title: "Sucesso Financeiro",
        duration: "18:40",
        url: mockAudioUrl,
        description: "Desenvolva hábitos e crenças que levam ao sucesso financeiro"
      },
      {
        id: "pr3",
        title: "Oportunidades",
        duration: "16:30",
        url: mockAudioUrl,
        description: "Aprenda a identificar e aproveitar oportunidades"
      },
      {
        id: "pr4",
        title: "Superação da Escassez",
        duration: "17:25",
        url: mockAudioUrl,
        description: "Liberte-se de crenças limitantes sobre dinheiro e sucesso"
      },
      {
        id: "pr5",
        title: "Empreendedorismo",
        duration: "21:10",
        url: mockAudioUrl,
        description: "Desenvolva a mentalidade empreendedora de sucesso"
      },
      {
        id: "pr6",
        title: "Investimentos Inteligentes",
        duration: "19:35",
        url: mockAudioUrl,
        description: "Tome decisões financeiras conscientes e inteligentes"
      },
      {
        id: "pr7",
        title: "Prosperidade Sustentável",
        duration: "15:20",
        url: mockAudioUrl,
        description: "Construa riqueza de forma ética e sustentável"
      },
      {
        id: "pr8",
        title: "Magnetismo para o Sucesso",
        duration: "14:45",
        url: mockAudioUrl,
        description: "Atraia oportunidades e pessoas que contribuem para seu sucesso"
      },
      {
        id: "pr9",
        title: "Riqueza Interior",
        duration: "16:55",
        url: mockAudioUrl,
        description: "Desenvolva riqueza emocional e espiritual além da material"
      }
    ]
  },
  {
    id: "saude",
    title: "Saúde",
    icon: Activity,
    audioCount: 8,
    description: "Desenvolva hábitos saudáveis e bem-estar físico e mental",
    audios: [
      {
        id: "sa1",
        title: "Sono Reparador",
        duration: "22:30",
        url: mockAudioUrl,
        description: "Melhore a qualidade do seu sono e descanso"
      },
      {
        id: "sa2",
        title: "Energia Vital",
        duration: "16:40",
        url: mockAudioUrl,
        description: "Aumente seus níveis de energia e vitalidade"
      },
      {
        id: "sa3",
        title: "Alimentação Consciente",
        duration: "18:20",
        url: mockAudioUrl,
        description: "Desenvolva uma relação saudável com a alimentação"
      },
      {
        id: "sa4",
        title: "Exercício e Motivação",
        duration: "15:15",
        url: mockAudioUrl,
        description: "Encontre motivação para manter uma rotina de exercícios"
      },
      {
        id: "sa5",
        title: "Cura e Regeneração",
        duration: "24:10",
        url: mockAudioUrl,
        description: "Ative os processos naturais de cura do seu corpo"
      },
      {
        id: "sa6",
        title: "Imunidade Forte",
        duration: "17:30",
        url: mockAudioUrl,
        description: "Fortaleça seu sistema imunológico naturalmente"
      },
      {
        id: "sa7",
        title: "Equilíbrio Corpo-Mente",
        duration: "19:45",
        url: mockAudioUrl,
        description: "Harmonize sua saúde física e mental"
      },
      {
        id: "sa8",
        title: "Longevidade Saudável",
        duration: "21:25",
        url: mockAudioUrl,
        description: "Desenvolva hábitos para uma vida longa e saudável"
      }
    ]
  },
  {
    id: "espiritualidade",
    title: "Espiritualidade",
    icon: Sparkles,
    audioCount: 6,
    description: "Conecte-se com sua essência e propósito de vida",
    audios: [
      {
        id: "es1",
        title: "Conexão Interior",
        duration: "25:30",
        url: mockAudioUrl,
        description: "Desenvolva uma conexão profunda com sua essência"
      },
      {
        id: "es2",
        title: "Propósito de Vida",
        duration: "20:15",
        url: mockAudioUrl,
        description: "Descubra e viva seu verdadeiro propósito de vida"
      },
      {
        id: "es3",
        title: "Gratidão e Presença",
        duration: "18:40",
        url: mockAudioUrl,
        description: "Cultive gratidão e presença no momento atual"
      },
      {
        id: "es4",
        title: "Intuição e Sabedoria",
        duration: "22:20",
        url: mockAudioUrl,
        description: "Desenvolva sua intuição e acesse sua sabedoria interior"
      },
      {
        id: "es5",
        title: "Paz Interior",
        duration: "26:10",
        url: mockAudioUrl,
        description: "Encontre paz interior independente das circunstâncias externas"
      },
      {
        id: "es6",
        title: "Transformação Espiritual",
        duration: "23:45",
        url: mockAudioUrl,
        description: "Experimente crescimento e transformação espiritual profunda"
      }
    ]
  }
];