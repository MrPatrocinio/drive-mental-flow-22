-- ============================================================================
-- FASE 3: Modelo Paga/Não Paga - Correção RLS e Limpeza
-- ============================================================================

-- 1. REMOVER POLICIES ANTIGAS da tabela audios
DROP POLICY IF EXISTS "Public can view non-premium and demo audios" ON public.audios;
DROP POLICY IF EXISTS "Subscribers can view premium audios" ON public.audios;
DROP POLICY IF EXISTS "Subscribers have full access" ON public.audios;

-- 2. CRIAR NOVAS POLICIES - Modelo Simplificado
-- Policy 1: Demos visíveis para todos (landing page)
CREATE POLICY "public_can_view_demo_audios"
ON public.audios
FOR SELECT
USING (is_demo = true);

-- Policy 2: Assinantes ativos veem TODOS os áudios
CREATE POLICY "subscribers_can_view_all_audios"
ON public.audios
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.subscribers s
    WHERE s.user_id = auth.uid()
      AND public.is_subscription_active(s.subscription_status)
  )
);

-- 3. TRIGGER INIT_BILLING - Criar registro automático ao cadastrar
CREATE OR REPLACE FUNCTION public.init_billing()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.subscribers (user_id, email, subscription_status, subscribed)
  VALUES (
    NEW.id,
    NEW.email,
    'none',
    false
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para executar após inserção em auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_init_billing ON auth.users;
CREATE TRIGGER on_auth_user_created_init_billing
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.init_billing();

-- 4. LIMPEZA - Remover coluna is_premium (não é mais usada)
ALTER TABLE public.audios DROP COLUMN IF EXISTS is_premium;