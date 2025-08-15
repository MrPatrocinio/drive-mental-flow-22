
-- Corrigir o áudio de demonstração para não ser premium
UPDATE public.audios 
SET is_premium = false 
WHERE id = (
  SELECT (content->>'demo_audio_id')::uuid 
  FROM public.landing_content 
  WHERE section = 'demo_config'
);

-- Garantir que temos pelo menos alguns áudios não-premium para demonstração
-- (caso não haja áudio demo configurado)
UPDATE public.audios 
SET is_premium = false 
WHERE id IN (
  SELECT id 
  FROM public.audios 
  ORDER BY created_at ASC 
  LIMIT 3
);
