
-- Atualizar todos os áudios existentes para não serem premium
UPDATE public.audios SET is_premium = false;

-- Simplificar as políticas RLS dos áudios para permitir acesso a todos os áudios para qualquer usuário autenticado
DROP POLICY IF EXISTS "Everyone can view non_premium and demo audios" ON public.audios;
DROP POLICY IF EXISTS "Subscribers can view premium audios" ON public.audios;

-- Criar nova política simplificada: todos podem ver áudios públicos, assinantes veem todos
CREATE POLICY "Everyone can view public audios" ON public.audios
  FOR SELECT 
  USING (true);

-- Política para assinantes terem acesso total (redundante mas mantém a estrutura)
CREATE POLICY "Subscribers have full access" ON public.audios
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL AND 
    EXISTS (
      SELECT 1 FROM subscribers 
      WHERE (
        (subscribers.user_id = auth.uid() OR subscribers.email = auth.email()) 
        AND subscribers.subscribed = true 
        AND (subscribers.subscription_end IS NULL OR subscribers.subscription_end > now())
      )
    )
  );
