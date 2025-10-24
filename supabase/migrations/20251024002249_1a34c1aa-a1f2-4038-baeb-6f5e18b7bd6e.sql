-- Deduplicar perfis por user_id (manter o mais recente)
WITH ranked AS (
  SELECT id, user_id, created_at, updated_at,
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY COALESCE(updated_at, created_at) DESC, created_at DESC) AS rn
  FROM public.profiles
)
DELETE FROM public.profiles p
USING ranked r
WHERE p.id = r.id
  AND r.rn > 1;

-- Criar índice único para profiles.user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='profiles_user_id_key'
  ) THEN
    CREATE UNIQUE INDEX profiles_user_id_key ON public.profiles(user_id);
  END IF;
END$$;

-- Deduplicar subscribers por user_id (manter o mais recente)
WITH ranked AS (
  SELECT id, user_id, created_at, updated_at,
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY COALESCE(updated_at, created_at) DESC, created_at DESC) AS rn
  FROM public.subscribers
  WHERE user_id IS NOT NULL
)
DELETE FROM public.subscribers s
USING ranked r
WHERE s.id = r.id
  AND r.rn > 1;

-- Criar índice único para subscribers.user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='subscribers_user_id_key'
  ) THEN
    CREATE UNIQUE INDEX subscribers_user_id_key ON public.subscribers(user_id);
  END IF;
END$$;