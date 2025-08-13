-- Fix security vulnerability in audios table RLS policies
-- Restrict premium content access to paying subscribers only

-- Drop the overly permissive policy that allows everyone to view all audios
DROP POLICY IF EXISTS "Everyone can view audios" ON public.audios;

-- Create policy for non-premium content - accessible to everyone
CREATE POLICY "Everyone can view non_premium audios" ON public.audios
FOR SELECT
USING (is_premium = false);

-- Create policy for premium content - only for authenticated subscribers
CREATE POLICY "Subscribers can view premium audios" ON public.audios
FOR SELECT
USING (
  is_premium = true AND
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.subscribers 
    WHERE (user_id = auth.uid() OR email = auth.email()) 
    AND subscribed = true 
    AND (subscription_end IS NULL OR subscription_end > now())
  )
);

-- Keep the existing admin policy intact
-- (Only admins can manage audios policy already exists and should remain)