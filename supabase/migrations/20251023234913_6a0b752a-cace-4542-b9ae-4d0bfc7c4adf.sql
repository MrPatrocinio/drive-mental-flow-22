-- ============================================
-- FASE 2: Status Detalhado de Assinatura
-- ============================================

-- 1. Criar tipo enum para subscription_status
CREATE TYPE public.subscription_status_enum AS ENUM (
  'none',           -- Sem assinatura
  'active',         -- Assinatura ativa
  'trialing',       -- Em período trial
  'past_due',       -- Pagamento atrasado
  'canceled',       -- Cancelada (ainda ativa até o fim do período)
  'incomplete',     -- Checkout incompleto
  'incomplete_expired', -- Checkout expirou
  'unpaid',         -- Não paga
  'paused'          -- Pausada
);

-- 2. Adicionar coluna subscription_status (mantendo subscribed por compatibilidade temporária)
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS subscription_status public.subscription_status_enum DEFAULT 'none';

-- 3. Criar índice para melhorar performance de queries por status
CREATE INDEX IF NOT EXISTS idx_subscribers_subscription_status 
ON public.subscribers(subscription_status);

-- 4. Migrar dados existentes: subscribed=true -> 'active', subscribed=false -> 'none'
UPDATE public.subscribers 
SET subscription_status = 
  CASE 
    WHEN subscribed = true THEN 'active'::public.subscription_status_enum
    ELSE 'none'::public.subscription_status_enum
  END
WHERE subscription_status = 'none'::public.subscription_status_enum;

-- 5. Criar função helper para verificar se status é "ativo" (active ou trialing)
CREATE OR REPLACE FUNCTION public.is_subscription_active(status public.subscription_status_enum)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT status IN ('active', 'trialing');
$$;

-- 6. Criar função para sincronizar subscription_status -> subscribed (compatibilidade)
CREATE OR REPLACE FUNCTION public.sync_subscription_status_to_subscribed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Sincronizar automaticamente: active/trialing -> subscribed=true
  NEW.subscribed = public.is_subscription_active(NEW.subscription_status);
  RETURN NEW;
END;
$$;

-- 7. Criar trigger para manter subscribed sincronizado (backward compatibility)
DROP TRIGGER IF EXISTS sync_subscription_status ON public.subscribers;
CREATE TRIGGER sync_subscription_status
BEFORE INSERT OR UPDATE OF subscription_status ON public.subscribers
FOR EACH ROW
EXECUTE FUNCTION public.sync_subscription_status_to_subscribed();

-- 8. Atualizar RLS para aceitar 'trialing' (expandir políticas existentes)
-- Nota: As políticas existentes já usam 'subscribed', que será sincronizada automaticamente pelo trigger

-- 9. Comentários para documentação
COMMENT ON TYPE public.subscription_status_enum IS 'Estados possíveis de uma assinatura no Stripe';
COMMENT ON COLUMN public.subscribers.subscription_status IS 'Status detalhado da assinatura (sincronizado automaticamente com subscribed)';
COMMENT ON FUNCTION public.is_subscription_active IS 'Verifica se um status representa assinatura ativa (active ou trialing)';
COMMENT ON FUNCTION public.sync_subscription_status_to_subscribed IS 'Mantém coluna subscribed sincronizada com subscription_status para backward compatibility';