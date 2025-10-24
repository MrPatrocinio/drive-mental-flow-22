-- Tabela para armazenar assinaturas pendentes (antes do usuário fazer signup/login)
CREATE TABLE IF NOT EXISTS public.pending_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  subscription_tier TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index para busca rápida por email
CREATE INDEX IF NOT EXISTS idx_pending_subscriptions_email ON public.pending_subscriptions(email);

-- Index para busca por session_id
CREATE INDEX IF NOT EXISTS idx_pending_subscriptions_session ON public.pending_subscriptions(session_id);

-- RLS: Admins podem ver tudo
CREATE POLICY "admin_view_pending_subscriptions" ON public.pending_subscriptions
  FOR SELECT
  USING (get_current_user_role() = 'admin');

-- Comentário explicativo
COMMENT ON TABLE public.pending_subscriptions IS 'Armazena assinaturas Stripe criadas antes do usuário fazer signup/login, para serem associadas posteriormente';