-- FASE 1: Correção crítica da exposição de áudio premium
-- Remove a política insegura que permite acesso total
DROP POLICY "Everyone can view public audios" ON public.audios;

-- Cria política segura para áudios não-premium e demos
CREATE POLICY "Public can view non-premium and demo audios" 
ON public.audios 
FOR SELECT 
USING (
  -- Permite áudios não-premium OU demos
  (is_premium = false OR is_demo = true)
);

-- Cria política específica para áudios premium (apenas assinantes)
CREATE POLICY "Subscribers can view premium audios" 
ON public.audios 
FOR SELECT 
USING (
  -- Apenas para áudios premium E usuário tem assinatura ativa
  is_premium = true 
  AND auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM subscribers 
    WHERE (
      (subscribers.user_id = auth.uid() OR subscribers.email = auth.email()) 
      AND subscribers.subscribed = true 
      AND (subscribers.subscription_end IS NULL OR subscribers.subscription_end > now())
    )
  )
);