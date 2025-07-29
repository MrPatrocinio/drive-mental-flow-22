// Legacy types for backward compatibility during migration

export interface EditableField {
  id: string;
  title: string;
  iconName: string;
  audioCount: number;
  description?: string;
}

export interface EditableAudio {
  id: string;
  title: string;
  duration: string;
  url: string;
  fieldId: string;
  tags?: string[];
}