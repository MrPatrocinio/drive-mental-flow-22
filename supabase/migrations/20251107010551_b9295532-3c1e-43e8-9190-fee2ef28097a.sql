-- FASE 2: Limpar políticas RLS duplicadas da tabela leads
-- Manter apenas políticas essenciais usando has_role()

BEGIN;

-- 2.1. Remover políticas antigas/duplicadas que causam conflito
DROP POLICY IF EXISTS "Admins can manage leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can view all leads" ON public.leads;

-- 2.2. Verificar e recriar políticas essenciais se necessário
-- (Essas já foram atualizadas na FASE 1, mas garantir que existem)

-- Política 1: Permitir INSERT anônimo (formulários públicos)
DROP POLICY IF EXISTS "Anyone can insert leads" ON public.leads;
CREATE POLICY "Anyone can insert leads"
ON public.leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Política 2: Bloquear SELECT para não-admins
DROP POLICY IF EXISTS "block_non_admin_lead_select" ON public.leads;
CREATE POLICY "block_non_admin_lead_select"
ON public.leads
FOR SELECT
TO anon, authenticated
USING (false);

-- Política 3: Permitir SELECT apenas para admins (já atualizada na FASE 1)
-- (mantida da FASE 1, não precisa recriar)

-- 2.3. Adicionar políticas de UPDATE e DELETE apenas para admin
DROP POLICY IF EXISTS "admin_can_update_leads" ON public.leads;
CREATE POLICY "admin_can_update_leads"
ON public.leads
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admin_can_delete_leads" ON public.leads;
CREATE POLICY "admin_can_delete_leads"
ON public.leads
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

COMMIT;

-- 2.4. Verificação: listar políticas finais da tabela leads
-- Deve retornar exatamente 5 políticas:
-- 1. Anyone can insert leads
-- 2. block_non_admin_lead_select
-- 3. allow_admin_to_read_leads_corrected (da FASE 1)
-- 4. admin_can_update_leads
-- 5. admin_can_delete_leads