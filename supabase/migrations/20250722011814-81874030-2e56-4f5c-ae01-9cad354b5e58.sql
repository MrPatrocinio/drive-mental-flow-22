
-- Correção 1: Implementar search_path seguro na função get_current_user_role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$function$;

-- Correção 2: Implementar search_path seguro na função update_field_audio_count
CREATE OR REPLACE FUNCTION public.update_field_audio_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.fields 
  SET audio_count = (
    SELECT COUNT(*) FROM public.audios WHERE field_id = COALESCE(NEW.field_id, OLD.field_id)
  )
  WHERE id = COALESCE(NEW.field_id, OLD.field_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Correção 3: Ajustar configuração de autenticação para reduzir tempo de expiração do OTP
-- (Isso será feito via configuração do Supabase, não SQL)

-- Correção 4: Criar bucket de storage para áudios com políticas de segurança
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audios',
  'audios',
  true,
  52428800, -- 50MB limit
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/aac']
);

-- Política para permitir upload de áudios apenas para admins
CREATE POLICY "Admins can upload audios"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'audios' AND 
  get_current_user_role() = 'admin'
);

-- Política para permitir visualização pública de áudios
CREATE POLICY "Everyone can view audios"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'audios');

-- Política para permitir admin deletar áudios
CREATE POLICY "Admins can delete audios"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'audios' AND 
  get_current_user_role() = 'admin'
);

-- Correção 5: Adicionar trigger para atualizar contagem de áudios
CREATE OR REPLACE TRIGGER update_field_audio_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.audios
FOR EACH ROW
EXECUTE FUNCTION public.update_field_audio_count();

-- Correção 6: Melhorar segurança das RLS policies existentes
-- Adicionar política mais restritiva para analytics_events
DROP POLICY IF EXISTS "Users can insert their own analytics events" ON public.analytics_events;
CREATE POLICY "Authenticated users can insert analytics events"
ON public.analytics_events 
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = user_id OR 
  (user_id IS NULL AND auth.uid() IS NOT NULL)
);
