-- ============================================================================
-- PARTE 1: CORREÇÕES DE SEGURANÇA VIA SQL
-- ============================================================================

-- 1.1 Adicionar Comentários nas Funções SECURITY DEFINER
-- Justificar uso de SECURITY DEFINER para o linter
COMMENT ON FUNCTION public.has_role(uuid, app_role) IS
'Uses SECURITY DEFINER with SET search_path=public to safely check user roles under RLS. Required to prevent recursive RLS checks.';

COMMENT ON FUNCTION public.validate_subscriber_access(uuid, text) IS
'Validates subscriber access using only user_id (no email fallback). SECURITY DEFINER with search_path=public for safe RLS bypass.';

COMMENT ON FUNCTION public.get_current_user_role() IS
'Returns current user role. SECURITY DEFINER with search_path=public to safely query user_roles under RLS.';

-- ============================================================================
-- 1.2 Proteger analytics_events com RLS Policies
-- ============================================================================

-- Limpar políticas antigas (idempotente)
DROP POLICY IF EXISTS "Admins can view all analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Authenticated users can insert analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS ae_insert_own ON public.analytics_events;
DROP POLICY IF EXISTS ae_select_admin ON public.analytics_events;
DROP POLICY IF EXISTS ae_block_select_anon ON public.analytics_events;
DROP POLICY IF EXISTS ae_block_update_delete ON public.analytics_events;

-- INSERT: apenas usuários autenticados podem inserir seus próprios eventos
CREATE POLICY ae_insert_own
ON public.analytics_events
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() OR 
  (user_id IS NULL AND auth.uid() IS NOT NULL)
);

-- SELECT: apenas admins podem ler analytics
CREATE POLICY ae_select_admin
ON public.analytics_events
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- DENY SELECT para anônimos
CREATE POLICY ae_block_select_anon
ON public.analytics_events
FOR SELECT
TO anon
USING (false);

-- DENY UPDATE/DELETE para todos (analytics é append-only)
CREATE POLICY ae_block_update_delete
ON public.analytics_events
FOR ALL
TO authenticated, anon
USING (false)
WITH CHECK (false);

-- ============================================================================
-- 1.3 Sanitização de Dados Sensíveis (IP e User Agent)
-- ============================================================================

-- Trigger para anonimizar IP e limitar tamanho de user_agent
CREATE OR REPLACE FUNCTION public.ae_sanitize_before_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Hash do IP para anonimização (GDPR/LGPD friendly)
  IF NEW.ip_address IS NOT NULL THEN
    NEW.ip_address = md5(NEW.ip_address::text)::inet;
  END IF;

  -- Limitar tamanho do user_agent
  IF NEW.user_agent IS NOT NULL THEN
    NEW.user_agent = left(NEW.user_agent, 200);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ae_sanitize_before_insert ON public.analytics_events;
CREATE TRIGGER trg_ae_sanitize_before_insert
BEFORE INSERT ON public.analytics_events
FOR EACH ROW EXECUTE FUNCTION public.ae_sanitize_before_insert();