-- Enable realtime for tables that need live updates
ALTER TABLE public.fields REPLICA IDENTITY FULL;
ALTER TABLE public.audios REPLICA IDENTITY FULL; 
ALTER TABLE public.landing_content REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.fields;
ALTER PUBLICATION supabase_realtime ADD TABLE public.audios;
ALTER PUBLICATION supabase_realtime ADD TABLE public.landing_content;