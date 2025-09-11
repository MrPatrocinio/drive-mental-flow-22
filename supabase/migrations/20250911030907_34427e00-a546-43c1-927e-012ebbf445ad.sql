-- FASE 2B: Correção da política que já existe

-- Proteger dados de business: Restringir acesso à tabela landing_content
-- Remove política existente para recriar corretamente
DROP POLICY IF EXISTS "Only admins can manage landing content" ON public.landing_content;

-- Recrear política mais específica para different operações
CREATE POLICY "Only admins can insert landing content" 
ON public.landing_content 
FOR INSERT 
TO authenticated
WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Only admins can update landing content" 
ON public.landing_content 
FOR UPDATE 
TO authenticated
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Only admins can delete landing content" 
ON public.landing_content 
FOR DELETE 
TO authenticated
USING (get_current_user_role() = 'admin');