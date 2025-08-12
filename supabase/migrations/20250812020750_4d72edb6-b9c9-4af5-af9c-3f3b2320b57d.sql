
-- Adicionar campo is_premium na tabela audios para controle de acesso
ALTER TABLE public.audios 
ADD COLUMN is_premium BOOLEAN NOT NULL DEFAULT false;

-- Criar índice para otimizar consultas de conteúdo premium
CREATE INDEX idx_audios_is_premium ON public.audios(is_premium);

-- Atualizar alguns áudios existentes como premium para demonstração
UPDATE public.audios 
SET is_premium = true 
WHERE id IN (
  SELECT id 
  FROM public.audios 
  ORDER BY created_at DESC 
  LIMIT (SELECT GREATEST(1, CAST(COUNT(*) * 0.7 AS INTEGER)) FROM public.audios)
);
