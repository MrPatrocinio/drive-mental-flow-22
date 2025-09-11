-- FASE 2A: Apenas correção das 6 funções com search path mutável

-- Corrigir função 1: set_field_display_order
CREATE OR REPLACE FUNCTION public.set_field_display_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Se display_order não foi definido, colocar no final
  IF NEW.display_order = 0 OR NEW.display_order IS NULL THEN
    NEW.display_order = (SELECT COALESCE(MAX(display_order), 0) + 1 FROM public.fields);
  END IF;
  RETURN NEW;
END;
$function$;

-- Corrigir função 2: validate_subscriber_access
CREATE OR REPLACE FUNCTION public.validate_subscriber_access(target_user_id uuid, target_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT 
    auth.uid() IS NOT NULL 
    AND (
      (target_user_id IS NOT NULL AND target_user_id = auth.uid())
      OR 
      (target_user_id IS NULL AND target_email = auth.email())
    );
$function$;

-- Corrigir função 3: ensure_single_demo_audio
CREATE OR REPLACE FUNCTION public.ensure_single_demo_audio()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

-- Corrigir função 4: log_subscriber_access
CREATE OR REPLACE FUNCTION public.log_subscriber_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Log apenas para operações de usuários autenticados (não service_role)
  IF current_setting('role') != 'service_role' THEN
    INSERT INTO public.subscriber_access_log (
      user_id, 
      action, 
      target_subscriber_id, 
      success
    ) VALUES (
      auth.uid(),
      TG_OP,
      COALESCE(NEW.id, OLD.id),
      true
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Corrigir função 5: handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'display_name', new.email),
    CASE 
      WHEN new.email = 'dppsoft@gmail.com' THEN 'admin'
      ELSE 'user'
    END
  );
  RETURN new;
END;
$function$;

-- Corrigir função 6: update_field_audio_count
CREATE OR REPLACE FUNCTION public.update_field_audio_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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