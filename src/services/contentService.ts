import { Field, Audio, fields as mockFields } from "@/data/mockData";
import { LucideIcon } from "lucide-react";

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

export interface EditableField extends Omit<Field, 'icon'> {
  iconName: string;
}

export interface EditableAudio extends Audio {
  fieldId: string;
}

export class ContentService {
  private static readonly CONTENT_KEY = "drive_mental_content";
  private static readonly FIELDS_KEY = "drive_mental_fields";
  private static readonly AUDIOS_KEY = "drive_mental_audios";
  private static readonly INITIALIZED_KEY = "drive_mental_initialized";

  // Landing Page Content Management
  static getLandingPageContent(): LandingPageContent {
    const stored = localStorage.getItem(this.CONTENT_KEY);
    if (stored) {
      return JSON.parse(stored);
    }

    // Default content
    const defaultContent: LandingPageContent = {
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
        copyright: "© 2024 Drive Mental. Todos os direitos reservados."
      }
    };

    this.saveLandingPageContent(defaultContent);
    return defaultContent;
  }

  static saveLandingPageContent(content: LandingPageContent): void {
    localStorage.setItem(this.CONTENT_KEY, JSON.stringify(content));
  }

  // Initialization
  static initializeIfNeeded(): void {
    const isInitialized = localStorage.getItem(this.INITIALIZED_KEY);
    if (!isInitialized) {
      this.initializeWithMockData();
      localStorage.setItem(this.INITIALIZED_KEY, "true");
    }
  }

  private static initializeWithMockData(): void {
    // Convert mock fields to editable format
    const editableFields: EditableField[] = mockFields.map(field => ({
      id: field.id,
      title: field.title,
      iconName: this.getIconName(field.icon),
      audioCount: field.audioCount,
      description: field.description,
      audios: []
    }));

    // Extract all audios and add fieldId
    const allAudios: EditableAudio[] = [];
    mockFields.forEach(field => {
      field.audios.forEach(audio => {
        allAudios.push({
          ...audio,
          fieldId: field.id
        });
      });
    });

    // Save to localStorage
    this.saveFields(editableFields);
    this.saveAudios(allAudios);
  }

  private static getIconName(icon: LucideIcon): string {
    // Map the icon component to string name
    const iconMap: Record<string, string> = {
      'Heart': 'Heart',
      'Brain': 'Brain',
      'Target': 'Target',
      'DollarSign': 'DollarSign',
      'Activity': 'Activity',
      'Sparkles': 'Sparkles'
    };
    
    return iconMap[icon.name] || 'Brain';
  }

  // Fields Management
  static getEditableFields(): EditableField[] {
    this.initializeIfNeeded();
    
    const stored = localStorage.getItem(this.FIELDS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }

    return [];
  }

  static saveFields(fields: EditableField[]): void {
    localStorage.setItem(this.FIELDS_KEY, JSON.stringify(fields));
  }

  static saveField(field: EditableField): void {
    const fields = this.getEditableFields();
    const index = fields.findIndex(f => f.id === field.id);
    
    if (index >= 0) {
      fields[index] = field;
    } else {
      fields.push(field);
    }
    
    this.saveFields(fields);
  }

  static deleteField(fieldId: string): void {
    const fields = this.getEditableFields().filter(f => f.id !== fieldId);
    this.saveFields(fields);
    
    // Remove all audios from this field
    const audios = this.getAudios().filter(a => a.fieldId !== fieldId);
    this.saveAudios(audios);
  }

  // Audios Management
  static getAudios(): EditableAudio[] {
    this.initializeIfNeeded();
    
    const stored = localStorage.getItem(this.AUDIOS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static saveAudios(audios: EditableAudio[]): void {
    localStorage.setItem(this.AUDIOS_KEY, JSON.stringify(audios));
  }

  static saveAudio(audio: EditableAudio): void {
    const audios = this.getAudios();
    const index = audios.findIndex(a => a.id === audio.id);
    
    if (index >= 0) {
      audios[index] = audio;
    } else {
      audios.push(audio);
    }
    
    this.saveAudios(audios);
    this.updateFieldAudioCount(audio.fieldId);
  }

  static deleteAudio(audioId: string): void {
    const audios = this.getAudios();
    const audioToDelete = audios.find(a => a.id === audioId);
    const filteredAudios = audios.filter(a => a.id !== audioId);
    
    this.saveAudios(filteredAudios);
    
    if (audioToDelete) {
      this.updateFieldAudioCount(audioToDelete.fieldId);
    }
  }

  static getAudiosByField(fieldId: string): EditableAudio[] {
    return this.getAudios().filter(audio => audio.fieldId === fieldId);
  }

  private static updateFieldAudioCount(fieldId: string): void {
    const fields = this.getEditableFields();
    const field = fields.find(f => f.id === fieldId);
    
    if (field) {
      field.audioCount = this.getAudiosByField(fieldId).length;
      this.saveFields(fields);
    }
  }

  // Utility methods
  static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}