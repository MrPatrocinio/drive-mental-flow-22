-- Atualizar a estrutura de landing_content para suportar gerenciamento de vídeos
-- Adicionar nova seção para vídeos disponíveis

INSERT INTO public.landing_content (section, content) 
VALUES (
  'videos',
  '{
    "active_video_id": null,
    "videos": []
  }'::jsonb
)
ON CONFLICT (section) DO UPDATE SET
  content = EXCLUDED.content,
  updated_at = now();