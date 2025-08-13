
-- Inserir configuração inicial de áudio na tabela landing_content
INSERT INTO public.landing_content (section, content)
VALUES (
  'audio_config',
  '{"pause_between_repeats_seconds": 3}'::jsonb
)
ON CONFLICT (section) DO UPDATE SET
  content = EXCLUDED.content,
  updated_at = now();
