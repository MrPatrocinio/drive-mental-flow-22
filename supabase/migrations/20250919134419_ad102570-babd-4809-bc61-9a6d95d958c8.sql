-- Create policy to allow public access to active background music tracks
-- This enables demo users (not authenticated) to access background music

CREATE POLICY "public_can_view_active_background_music" 
ON public.background_music 
FOR SELECT 
TO anon 
USING (is_active = true);

-- Also ensure authenticated users can still access (existing policy should handle this)
-- The existing policy "Authenticated users can view background music" already covers this