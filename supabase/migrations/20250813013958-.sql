-- Fix security vulnerability in subscribers table RLS policies
-- Remove overly permissive policies and create secure ones

-- Drop the insecure policies
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;

-- Create secure UPDATE policy
-- Users can only update their own subscription records (matched by user_id or email)
CREATE POLICY "update_own_subscription_secure" ON public.subscribers
FOR UPDATE
USING (
  (auth.uid() IS NOT NULL) AND 
  (
    (user_id = auth.uid()) OR 
    (email = auth.email())
  )
);

-- Create secure INSERT policy  
-- Users can only insert subscriptions for themselves
CREATE POLICY "insert_own_subscription_secure" ON public.subscribers
FOR INSERT
WITH CHECK (
  (auth.uid() IS NOT NULL) AND
  (
    (user_id = auth.uid()) OR 
    (user_id IS NULL AND email = auth.email())
  )
);