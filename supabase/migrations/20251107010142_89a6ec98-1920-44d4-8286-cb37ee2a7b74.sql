-- FASE 1: Migração do Sistema de Roles para user_roles
-- Proteção contra escalação de privilégios

-- 1.1. Criar ENUM de roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 1.2. Criar tabela user_roles isolada
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 1.3. Habilitar RLS (usuários NÃO podem modificar seus próprios roles)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 1.4. Apenas service_role pode gerenciar roles
CREATE POLICY "Only service_role can manage user_roles"
ON public.user_roles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 1.5. Usuários podem VER seus próprios roles (mas não modificar)
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 1.6. Criar função segura para verificar roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 1.7. Atualizar get_current_user_role() para usar has_role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE 
      WHEN public.has_role(auth.uid(), 'admin') THEN 'admin'
      ELSE 'user'
    END;
$$;

-- 1.8. Migrar dados existentes de profiles.role para user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT 
  user_id,
  role::public.app_role
FROM public.profiles
WHERE role IS NOT NULL
  AND role IN ('admin', 'user')
ON CONFLICT (user_id, role) DO NOTHING;

-- 1.9. Atualizar políticas RLS críticas para usar has_role()

-- Audios
DROP POLICY IF EXISTS "Only admins can manage audios" ON public.audios;
CREATE POLICY "Only admins can manage audios"
ON public.audios
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Fields
DROP POLICY IF EXISTS "Only admins can manage fields" ON public.fields;
CREATE POLICY "Only admins can manage fields"
ON public.fields
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Landing Content
DROP POLICY IF EXISTS "Only admins can insert landing content" ON public.landing_content;
DROP POLICY IF EXISTS "Only admins can update landing content" ON public.landing_content;
DROP POLICY IF EXISTS "Only admins can delete landing content" ON public.landing_content;

CREATE POLICY "Only admins can insert landing content"
ON public.landing_content
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update landing content"
ON public.landing_content
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete landing content"
ON public.landing_content
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Background Music
DROP POLICY IF EXISTS "Only admins can manage background music" ON public.background_music;
CREATE POLICY "Only admins can manage background music"
ON public.background_music
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Background Music Settings
DROP POLICY IF EXISTS "Only admins can manage background music settings" ON public.background_music_settings;
CREATE POLICY "Only admins can manage background music settings"
ON public.background_music_settings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Profiles (admin view all)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Subscribers (admin full access)
DROP POLICY IF EXISTS "admin_full_access_subscribers" ON public.subscribers;
CREATE POLICY "admin_full_access_subscribers"
ON public.subscribers
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Audio History (admin view all)
DROP POLICY IF EXISTS "Admins can view all history" ON public.audio_history;
CREATE POLICY "Admins can view all history"
ON public.audio_history
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Favorites (admin view all)
DROP POLICY IF EXISTS "Admins can view all favorites" ON public.favorites;
CREATE POLICY "Admins can view all favorites"
ON public.favorites
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Playlists (admin view all)
DROP POLICY IF EXISTS "Admins can view all playlists" ON public.playlists;
CREATE POLICY "Admins can view all playlists"
ON public.playlists
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Playlist Items (admin view stats)
DROP POLICY IF EXISTS "Admins can view playlist stats" ON public.playlist_items;
CREATE POLICY "Admins can view playlist stats"
ON public.playlist_items
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Notifications (admin manage all)
DROP POLICY IF EXISTS "Admins can manage all notifications" ON public.notifications;
CREATE POLICY "Admins can manage all notifications"
ON public.notifications
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Guarantee Enrollments (admin manage + view all)
DROP POLICY IF EXISTS "Admins can view all guarantee enrollments" ON public.guarantee_enrollments;
DROP POLICY IF EXISTS "Admins can manage guarantee enrollments" ON public.guarantee_enrollments;

CREATE POLICY "Admins can view all guarantee enrollments"
ON public.guarantee_enrollments
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage guarantee enrollments"
ON public.guarantee_enrollments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Guarantee Daily (admin view all)
DROP POLICY IF EXISTS "Admins can view all guarantee daily" ON public.guarantee_daily;
CREATE POLICY "Admins can view all guarantee daily"
ON public.guarantee_daily
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Leads (admin manage + read)
DROP POLICY IF EXISTS "Admins can manage leads" ON public.leads;
DROP POLICY IF EXISTS "allow_admin_to_read_leads_corrected" ON public.leads;

CREATE POLICY "allow_admin_to_read_leads_corrected"
ON public.leads
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage leads"
ON public.leads
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Subscriber Access Log (admin view)
DROP POLICY IF EXISTS "admin_view_access_log" ON public.subscriber_access_log;
CREATE POLICY "admin_view_access_log"
ON public.subscriber_access_log
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Pending Subscriptions (admin view)
DROP POLICY IF EXISTS "admin_view_pending_subscriptions" ON public.pending_subscriptions;
CREATE POLICY "admin_view_pending_subscriptions"
ON public.pending_subscriptions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));