-- ========================================
-- FASE 1: Corrigir pending_subscriptions (CRÍTICO)
-- ========================================

-- Bloquear INSERT para usuários comuns (apenas service_role via webhook pode inserir)
CREATE POLICY "block_user_insert_pending_subscriptions"
ON public.pending_subscriptions
FOR INSERT
TO authenticated
WITH CHECK (false);

-- Bloquear UPDATE para todos usuários
CREATE POLICY "block_user_update_pending_subscriptions"
ON public.pending_subscriptions
FOR UPDATE
TO authenticated, anon
USING (false);

-- Bloquear DELETE para todos usuários
CREATE POLICY "block_user_delete_pending_subscriptions"
ON public.pending_subscriptions
FOR DELETE
TO authenticated, anon
USING (false);

-- ========================================
-- FASE 2: Fortalecer segurança de subscribers
-- ========================================

-- 2.1. Migrar dados antigos: vincular user_id via email
UPDATE public.subscribers
SET user_id = (
  SELECT au.id 
  FROM auth.users au 
  WHERE au.email = subscribers.email
)
WHERE user_id IS NULL AND email IS NOT NULL;

-- 2.2. Remover registros órfãos (sem user_id válido após migração)
DELETE FROM public.subscribers
WHERE user_id IS NULL;

-- 2.3. Tornar user_id obrigatório
ALTER TABLE public.subscribers
ALTER COLUMN user_id SET NOT NULL;

-- 2.4. Atualizar função de validação (remover fallback por email - APENAS user_id)
CREATE OR REPLACE FUNCTION public.validate_subscriber_access(target_user_id uuid, target_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    auth.uid() IS NOT NULL 
    AND target_user_id IS NOT NULL 
    AND target_user_id = auth.uid();
$$;

-- 2.5. Adicionar índice único para performance e integridade
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscribers_user_id 
ON public.subscribers(user_id);