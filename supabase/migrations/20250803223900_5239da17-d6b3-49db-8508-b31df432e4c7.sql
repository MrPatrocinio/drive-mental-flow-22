-- Adicionar configuração de áudio de demonstração na landing_content
INSERT INTO public.landing_content (section, content) 
VALUES ('demo_config', '{
  "demo_audio_id": null,
  "demo_title": "Demonstração Gratuita",
  "demo_description": "Experimente nosso Drive Mental gratuitamente e veja como pode transformar sua vida."
}'::jsonb)
ON CONFLICT (section) DO UPDATE SET
content = EXCLUDED.content,
updated_at = now();