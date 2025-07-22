-- Adicionar sistema de tags aos áudios
ALTER TABLE public.audios 
ADD COLUMN tags TEXT[] DEFAULT '{}';

-- Criar tabela de favoritos
CREATE TABLE public.favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  audio_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, audio_id)
);

-- Enable RLS para favoritos
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Políticas para favoritos
CREATE POLICY "Users can manage their own favorites"
ON public.favorites 
FOR ALL 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all favorites"
ON public.favorites 
FOR SELECT 
TO authenticated
USING (get_current_user_role() = 'admin');

-- Criar tabela de histórico de reprodução
CREATE TABLE public.audio_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  audio_id UUID NOT NULL,
  played_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  progress_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false
);

-- Enable RLS para histórico
ALTER TABLE public.audio_history ENABLE ROW LEVEL SECURITY;

-- Políticas para histórico
CREATE POLICY "Users can manage their own history"
ON public.audio_history 
FOR ALL 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all history"
ON public.audio_history 
FOR SELECT 
TO authenticated
USING (get_current_user_role() = 'admin');

-- Índices para performance
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_favorites_audio_id ON public.favorites(audio_id);
CREATE INDEX idx_audio_history_user_id ON public.audio_history(user_id);
CREATE INDEX idx_audio_history_audio_id ON public.audio_history(audio_id);
CREATE INDEX idx_audios_tags ON public.audios USING GIN(tags);

-- Popular banco com campos reais de desenvolvimento pessoal
INSERT INTO public.fields (title, description, icon_name) VALUES
('Autoestima', 'Desenvolva uma imagem positiva de si mesmo e aumente sua confiança pessoal', 'Heart'),
('Foco e Concentração', 'Melhore sua capacidade de concentração e produtividade no dia a dia', 'Target'),
('Gestão de Estresse', 'Aprenda técnicas para lidar com pressão e ansiedade de forma saudável', 'Shield'),
('Relacionamentos', 'Desenvolva habilidades para construir relacionamentos mais saudáveis e duradouros', 'Users'),
('Motivação', 'Encontre sua motivação interna e mantenha-se inspirado para alcançar seus objetivos', 'Zap'),
('Sono Reparador', 'Melhore a qualidade do seu sono e desperte mais revigorado', 'Moon'),
('Criatividade', 'Desperte seu potencial criativo e encontre soluções inovadoras', 'Lightbulb'),
('Liderança', 'Desenvolva habilidades de liderança e influência positiva', 'Crown'),
('Mindfulness', 'Pratique a atenção plena e viva o presente com mais consciência', 'Brain'),
('Propósito de Vida', 'Descubra seu propósito e alinhe suas ações com seus valores', 'Compass');

-- Popular com áudios de exemplo (URLs fictícias para demonstração)
INSERT INTO public.audios (title, field_id, url, duration, tags) VALUES
-- Autoestima
('Afirmações de Autoestima Matinal', (SELECT id FROM public.fields WHERE title = 'Autoestima'), 'https://example.com/audio1.mp3', '15:30', ARRAY['afirmações', 'manhã', 'autoconfiança']),
('Superando a Autocrítica', (SELECT id FROM public.fields WHERE title = 'Autoestima'), 'https://example.com/audio2.mp3', '22:45', ARRAY['autocrítica', 'autocompaixão', 'healing']),
('Construindo Confiança Interior', (SELECT id FROM public.fields WHERE title = 'Autoestima'), 'https://example.com/audio3.mp3', '18:20', ARRAY['confiança', 'empoderamento', 'força interior']),

-- Foco e Concentração
('Meditação para Foco Profundo', (SELECT id FROM public.fields WHERE title = 'Foco e Concentração'), 'https://example.com/audio4.mp3', '25:00', ARRAY['meditação', 'concentração', 'produtividade']),
('Eliminando Distrações Mentais', (SELECT id FROM public.fields WHERE title = 'Foco e Concentração'), 'https://example.com/audio5.mp3', '20:15', ARRAY['distração', 'clareza mental', 'focus']),

-- Gestão de Estresse
('Respiração para Alívio do Estresse', (SELECT id FROM public.fields WHERE title = 'Gestão de Estresse'), 'https://example.com/audio6.mp3', '12:30', ARRAY['respiração', 'relaxamento', 'ansiedade']),
('Técnicas de Relaxamento Profundo', (SELECT id FROM public.fields WHERE title = 'Gestão de Estresse'), 'https://example.com/audio7.mp3', '28:00', ARRAY['relaxamento', 'tensão', 'calma']),

-- Relacionamentos
('Comunicação Empática', (SELECT id FROM public.fields WHERE title = 'Relacionamentos'), 'https://example.com/audio8.mp3', '19:45', ARRAY['comunicação', 'empatia', 'relacionamentos']),
('Estabelecendo Limites Saudáveis', (SELECT id FROM public.fields WHERE title = 'Relacionamentos'), 'https://example.com/audio9.mp3', '16:30', ARRAY['limites', 'autoestima', 'relacionamentos']),

-- Motivação
('Encontrando Sua Motivação Interior', (SELECT id FROM public.fields WHERE title = 'Motivação'), 'https://example.com/audio10.mp3', '21:00', ARRAY['motivação', 'propósito', 'energia']),
('Superando a Procrastinação', (SELECT id FROM public.fields WHERE title = 'Motivação'), 'https://example.com/audio11.mp3', '17:15', ARRAY['procrastinação', 'ação', 'disciplina']),

-- Sono Reparador
('Meditação para o Sono', (SELECT id FROM public.fields WHERE title = 'Sono Reparador'), 'https://example.com/audio12.mp3', '35:00', ARRAY['sono', 'relaxamento', 'insônia']),
('Preparação para uma Noite Tranquila', (SELECT id FROM public.fields WHERE title = 'Sono Reparador'), 'https://example.com/audio13.mp3', '14:20', ARRAY['sono', 'rotina noturna', 'paz']),

-- Criatividade
('Desbloqueando o Potencial Criativo', (SELECT id FROM public.fields WHERE title = 'Criatividade'), 'https://example.com/audio14.mp3', '23:30', ARRAY['criatividade', 'inovação', 'imaginação']),
('Superando Bloqueios Criativos', (SELECT id FROM public.fields WHERE title = 'Criatividade'), 'https://example.com/audio15.mp3', '18:45', ARRAY['bloqueio criativo', 'inspiração', 'fluxo']),

-- Liderança
('Desenvolvendo Presença de Liderança', (SELECT id FROM public.fields WHERE title = 'Liderança'), 'https://example.com/audio16.mp3', '26:15', ARRAY['liderança', 'presença', 'influência']),
('Comunicação de Líder', (SELECT id FROM public.fields WHERE title = 'Liderança'), 'https://example.com/audio17.mp3', '22:00', ARRAY['comunicação', 'liderança', 'influência']),

-- Mindfulness
('Atenção Plena no Presente', (SELECT id FROM public.fields WHERE title = 'Mindfulness'), 'https://example.com/audio18.mp3', '20:30', ARRAY['mindfulness', 'presente', 'consciência']),
('Meditação Body Scan', (SELECT id FROM public.fields WHERE title = 'Mindfulness'), 'https://example.com/audio19.mp3', '30:00', ARRAY['body scan', 'consciência corporal', 'relaxamento']),

-- Propósito de Vida
('Descobrindo Seus Valores Centrais', (SELECT id FROM public.fields WHERE title = 'Propósito de Vida'), 'https://example.com/audio20.mp3', '24:45', ARRAY['valores', 'propósito', 'significado']),
('Alinhando Ações com Propósito', (SELECT id FROM public.fields WHERE title = 'Propósito de Vida'), 'https://example.com/audio21.mp3', '19:30', ARRAY['propósito', 'ação', 'alinhamento']);