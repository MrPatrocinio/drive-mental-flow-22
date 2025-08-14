-- Security Fix: Strengthen RLS policies for subscribers table to prevent unauthorized access

-- Drop existing policies
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "insert_own_subscription_secure" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription_secure" ON public.subscribers;

-- Create secure policies with proper authentication checks

-- 1. Users can only view their own subscription data (requires authentication)
CREATE POLICY "users_select_own_subscription" ON public.subscribers
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND (
    user_id = auth.uid() 
    OR (user_id IS NULL AND email = auth.email())
  )
);

-- 2. Admins can view all subscription data
CREATE POLICY "admins_select_all_subscriptions" ON public.subscribers
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND get_current_user_role() = 'admin'
);

-- 3. Only authenticated users can insert their own subscription data
CREATE POLICY "users_insert_own_subscription" ON public.subscribers
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND (
    user_id = auth.uid() 
    OR (user_id IS NULL AND email = auth.email())
  )
);

-- 4. Edge functions can insert/update using service role (bypasses RLS)
CREATE POLICY "service_role_manage_subscriptions" ON public.subscribers
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 5. Only authenticated users can update their own subscription data
CREATE POLICY "users_update_own_subscription" ON public.subscribers
FOR UPDATE
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND (
    user_id = auth.uid() 
    OR (user_id IS NULL AND email = auth.email())
  )
)
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND (
    user_id = auth.uid() 
    OR (user_id IS NULL AND email = auth.email())
  )
);

-- 6. Admins can update any subscription data
CREATE POLICY "admins_update_all_subscriptions" ON public.subscribers
FOR UPDATE
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND get_current_user_role() = 'admin'
)
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND get_current_user_role() = 'admin'
);

-- Ensure no DELETE operations are allowed except by service role
CREATE POLICY "service_role_delete_subscriptions" ON public.subscribers
FOR DELETE
TO service_role
USING (true);