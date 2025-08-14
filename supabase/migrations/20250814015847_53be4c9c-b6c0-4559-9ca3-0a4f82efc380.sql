
-- SOLUÇÃO DEFINITIVA: Reforçar completamente a segurança da tabela subscribers
-- Seguindo princípios SRP, DRY, SSOT, KISS e YAGNI

-- 1. Primeiro, remover TODAS as políticas existentes para garantir estado limpo
DROP POLICY IF EXISTS "users_select_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "admins_select_all_subscriptions" ON public.subscribers;
DROP POLICY IF EXISTS "users_insert_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "service_role_manage_subscriptions" ON public.subscribers;
DROP POLICY IF EXISTS "users_update_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "admins_update_all_subscriptions" ON public.subscribers;
DROP POLICY IF EXISTS "service_role_delete_subscriptions" ON public.subscribers;

-- Remover também possíveis políticas antigas com nomes diferentes
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "insert_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "insert_own_subscription_secure" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription_secure" ON public.subscribers;

-- 2. Garantir que RLS esteja habilitado
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- 3. Criar função de validação de segurança (Princípio SRP)
CREATE OR REPLACE FUNCTION public.validate_subscriber_access(target_user_id UUID, target_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    auth.uid() IS NOT NULL 
    AND (
      (target_user_id IS NOT NULL AND target_user_id = auth.uid())
      OR 
      (target_user_id IS NULL AND target_email = auth.email())
    );
$$;

-- 4. Implementar políticas com máxima segurança (Princípio KISS)

-- SELECT: Usuários só veem seus próprios dados
CREATE POLICY "secure_select_own_subscription" ON public.subscribers
FOR SELECT
TO authenticated
USING (validate_subscriber_access(user_id, email));

-- INSERT: Usuários só podem inserir seus próprios dados
CREATE POLICY "secure_insert_own_subscription" ON public.subscribers
FOR INSERT  
TO authenticated
WITH CHECK (validate_subscriber_access(user_id, email));

-- UPDATE: Usuários só podem atualizar seus próprios dados
CREATE POLICY "secure_update_own_subscription" ON public.subscribers
FOR UPDATE
TO authenticated
USING (validate_subscriber_access(user_id, email))
WITH CHECK (validate_subscriber_access(user_id, email));

-- Políticas para ADMIN (Princípio SRP - responsabilidade separada)
CREATE POLICY "admin_full_access_subscribers" ON public.subscribers
FOR ALL
TO authenticated
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

-- Política para Service Role (Edge Functions)
CREATE POLICY "service_role_full_access_subscribers" ON public.subscribers
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 5. Negar explicitamente DELETE para usuários normais (apenas service role e admin)
-- Não criamos política de DELETE para authenticated users, só para service_role

-- 6. Criar tabela de auditoria para monitorar acessos (Princípio SSOT)
CREATE TABLE IF NOT EXISTS public.subscriber_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  target_subscriber_id UUID,
  success BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na tabela de auditoria
ALTER TABLE public.subscriber_access_log ENABLE ROW LEVEL SECURITY;

-- Política para log: apenas admins podem ver
CREATE POLICY "admin_view_access_log" ON public.subscriber_access_log
FOR SELECT
TO authenticated
USING (get_current_user_role() = 'admin');

-- 7. Trigger para log de segurança (monitoramento)
CREATE OR REPLACE FUNCTION public.log_subscriber_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Anexar trigger
DROP TRIGGER IF EXISTS log_subscriber_access_trigger ON public.subscribers;
CREATE TRIGGER log_subscriber_access_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.log_subscriber_access();

-- 8. Forçar atualização das estatísticas e cache do planner
ANALYZE public.subscribers;
