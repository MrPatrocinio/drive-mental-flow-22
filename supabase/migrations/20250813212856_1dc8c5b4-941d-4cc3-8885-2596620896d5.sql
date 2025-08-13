
-- Update RLS policy to allow public access to demo audios
-- This fixes the issue where demo audios marked as premium were inaccessible

-- Drop the existing policy for non-premium audios
DROP POLICY IF EXISTS "Everyone can view non_premium audios" ON public.audios;

-- Create new policy that includes demo audios
CREATE POLICY "Everyone can view non_premium and demo audios" ON public.audios
FOR SELECT
USING (
  -- Non-premium audios are always accessible
  is_premium = false 
  OR 
  -- OR audios configured as demo are accessible to everyone
  id = (
    SELECT (content->>'demo_audio_id')::uuid 
    FROM public.landing_content 
    WHERE section = 'demo_config'
  )
);
