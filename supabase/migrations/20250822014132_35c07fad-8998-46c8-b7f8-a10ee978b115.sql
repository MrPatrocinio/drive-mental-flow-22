
-- Adicionar coluna is_demo na tabela audios
ALTER TABLE public.audios ADD COLUMN is_demo boolean NOT NULL DEFAULT false;

-- Criar função para garantir que apenas um áudio seja demo por vez
CREATE OR REPLACE FUNCTION public.ensure_single_demo_audio()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Se estamos marcando um áudio como demo
  IF NEW.is_demo = true AND (OLD.is_demo IS NULL OR OLD.is_demo = false) THEN
    -- Desmarcar todos os outros áudios como demo
    UPDATE public.audios 
    SET is_demo = false 
    WHERE id != NEW.id AND is_demo = true;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Criar trigger para executar a função antes de atualizar
CREATE TRIGGER ensure_single_demo_audio_trigger
  BEFORE UPDATE ON public.audios
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_single_demo_audio();

-- Criar trigger para executar a função antes de inserir
CREATE TRIGGER ensure_single_demo_audio_insert_trigger
  BEFORE INSERT ON public.audios
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_single_demo_audio();
