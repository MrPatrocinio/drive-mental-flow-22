-- Habilitar realtime para as tabelas relevantes
ALTER TABLE public.fields REPLICA IDENTITY FULL;
ALTER TABLE public.audios REPLICA IDENTITY FULL;
ALTER TABLE public.landing_content REPLICA IDENTITY FULL;

-- Adicionar as tabelas à publicação do realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.fields;
ALTER PUBLICATION supabase_realtime ADD TABLE public.audios;
ALTER PUBLICATION supabase_realtime ADD TABLE public.landing_content;