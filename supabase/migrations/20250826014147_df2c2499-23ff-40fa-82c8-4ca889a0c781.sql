
-- Habilitar REPLICA IDENTITY FULL para capturar dados completos durante updates
ALTER TABLE public.landing_content REPLICA IDENTITY FULL;

-- Adicionar a tabela à publicação de realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.landing_content;
