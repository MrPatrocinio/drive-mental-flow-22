-- ============================================
-- FASE 1: Correções Urgentes de Billing
-- ============================================

-- 1. Adicionar coluna stripe_subscription_id na tabela subscribers
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS stripe_subscription_id text UNIQUE;

-- 2. Criar índice para melhorar performance de queries por subscription_id
CREATE INDEX IF NOT EXISTS idx_subscribers_stripe_subscription_id 
ON public.subscribers(stripe_subscription_id);

-- 3. Adicionar índice composto para queries de validação
CREATE INDEX IF NOT EXISTS idx_subscribers_user_subscribed 
ON public.subscribers(user_id, subscribed) 
WHERE subscribed = true;

-- 4. Melhorar a função validate_subscriber_access para priorizar user_id
CREATE OR REPLACE FUNCTION public.validate_subscriber_access(target_user_id uuid, target_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    auth.uid() IS NOT NULL 
    AND (
      -- Prioridade 1: Validação por user_id (mais seguro)
      (target_user_id IS NOT NULL AND target_user_id = auth.uid())
      OR 
      -- Fallback: Validação por email (compatibilidade com dados antigos)
      (target_user_id IS NULL AND target_email IS NOT NULL AND target_email = auth.email())
    );
$$;

-- 5. Comentários para documentação
COMMENT ON COLUMN public.subscribers.stripe_subscription_id IS 'ID da assinatura no Stripe (sub_xxx) - usado para sincronização e gerenciamento';
COMMENT ON FUNCTION public.validate_subscriber_access IS 'Valida acesso do usuário aos dados de assinatura, priorizando user_id sobre email';