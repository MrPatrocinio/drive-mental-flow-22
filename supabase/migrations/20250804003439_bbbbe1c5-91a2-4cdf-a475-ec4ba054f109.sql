-- Criar tabela para músicas de fundo
CREATE TABLE public.background_music (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para configurações de música de fundo
CREATE TABLE public.background_music_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  volume_percentage INTEGER NOT NULL DEFAULT 25 CHECK (volume_percentage >= 0 AND volume_percentage <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.background_music ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.background_music_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para background_music
CREATE POLICY "Everyone can view background music" 
ON public.background_music 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage background music" 
ON public.background_music 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- Políticas para background_music_settings
CREATE POLICY "Everyone can view background music settings" 
ON public.background_music_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage background music settings" 
ON public.background_music_settings 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- Criar trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_background_music_updated_at
  BEFORE UPDATE ON public.background_music
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_background_music_settings_updated_at
  BEFORE UPDATE ON public.background_music_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Políticas de storage para bucket audios (para músicas de fundo)
CREATE POLICY "Admins can upload background music files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'audios' 
  AND get_current_user_role() = 'admin'
  AND (storage.foldername(name))[1] = 'background-music'
);

CREATE POLICY "Admins can view background music files" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'audios' 
  AND (storage.foldername(name))[1] = 'background-music'
);

CREATE POLICY "Admins can delete background music files" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'audios' 
  AND get_current_user_role() = 'admin'
  AND (storage.foldername(name))[1] = 'background-music'
);