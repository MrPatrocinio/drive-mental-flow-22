-- Aprimorar políticas RLS para maior granularidade entre admin e usuários

-- Política para usuários regulares acessarem seus próprios dados de auditoria
CREATE POLICY "Users can view their own playlist activity" 
ON public.playlists 
FOR SELECT 
USING (auth.uid() = user_id AND get_current_user_role() = 'user');

-- Política para usuários regulares gerenciarem apenas seus próprios playlists
CREATE POLICY "Users can manage only their own playlists" 
ON public.playlists 
FOR ALL 
USING (auth.uid() = user_id AND get_current_user_role() = 'user');

-- Política para playlist_items baseada no ownership do playlist
CREATE POLICY "Users can manage items in their own playlists" 
ON public.playlist_items 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.playlists 
    WHERE playlists.id = playlist_items.playlist_id 
    AND playlists.user_id = auth.uid()
    AND get_current_user_role() = 'user'
  )
);

-- Política para admins visualizarem estatísticas dos playlists
CREATE POLICY "Admins can view playlist stats" 
ON public.playlist_items 
FOR SELECT 
USING (get_current_user_role() = 'admin');

-- Garantir que apenas admins possam modificar conteúdo crítico
DROP POLICY IF EXISTS "Admins can manage landing content" ON public.landing_content;
CREATE POLICY "Only admins can manage landing content" 
ON public.landing_content 
FOR ALL 
USING (get_current_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can manage fields" ON public.fields;
CREATE POLICY "Only admins can manage fields" 
ON public.fields 
FOR ALL 
USING (get_current_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can manage audios" ON public.audios;
CREATE POLICY "Only admins can manage audios" 
ON public.audios 
FOR ALL 
USING (get_current_user_role() = 'admin');