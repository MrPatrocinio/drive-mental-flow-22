-- ============================================
-- CORREÇÃO DE VULNERABILIDADES - DRIVE MENTAL
-- Data: 2025-01-07
-- Objetivo: Aplicar RLS na tabela leads + hardening de funções
-- ============================================

-- ============================================
-- 1) 🔴 CRÍTICA: RLS na tabela LEADS
-- ============================================

-- Garantir RLS ativo
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Limpar políticas antigas de SELECT (se existirem)
DROP POLICY IF EXISTS "block_non_admin_lead_select" ON public.leads;
DROP POLICY IF EXISTS "allow_admin_to_read_leads_corrected" ON public.leads;

-- NOVA: Bloquear leitura para todos por padrão
CREATE POLICY "block_non_admin_lead_select"
ON public.leads
FOR SELECT
TO anon, authenticated
USING (false);

-- NOVA: Permitir leitura apenas para ADMINs (usando função do projeto)
CREATE POLICY "allow_admin_to_read_leads_corrected"
ON public.leads
FOR SELECT
TO authenticated
USING (get_current_user_role() = 'admin');

-- ============================================
-- 2) 🟡 RECOMENDADA: Hardening de funções
-- ============================================

-- update_updated_at_column() NÃO TEM search_path definido
ALTER FUNCTION public.update_updated_at_column() SET search_path = 'public';

-- handle_new_user() JÁ TEM search_path = 'public', mas garantir idempotência
ALTER FUNCTION public.handle_new_user() SET search_path = 'public';

-- Garantir que todas as funções SECURITY DEFINER têm search_path
ALTER FUNCTION public.is_subscription_active(subscription_status_enum) SET search_path = 'public';
ALTER FUNCTION public.validate_subscriber_access(uuid, text) SET search_path = 'public';
ALTER FUNCTION public.get_current_user_role() SET search_path = 'public';

-- ============================================
-- 3) ✅ COMENTÁRIOS DE VALIDAÇÃO
-- ============================================

-- Para validar após aplicar a migration, execute:
-- 
-- Verificar políticas criadas:
-- SELECT schemaname, tablename, policyname, cmd, qual
-- FROM pg_policies
-- WHERE tablename = 'leads'
-- ORDER BY policyname;
-- 
-- Verificar funções com search_path:
-- SELECT 
--   n.nspname AS schema,
--   p.proname AS function,
--   p.prosecdef AS is_security_definer,
--   p.proconfig AS config
-- FROM pg_proc p
-- JOIN pg_namespace n ON n.oid = p.pronamespace
-- WHERE n.nspname = 'public'
--   AND p.proname IN (
--     'handle_new_user', 
--     'update_updated_at_column',
--     'get_current_user_role',
--     'validate_subscriber_access',
--     'is_subscription_active'
--   )
-- ORDER BY p.proname;