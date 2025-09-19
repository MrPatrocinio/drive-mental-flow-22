-- Criar schema para views de aplicação
CREATE SCHEMA IF NOT EXISTS app;

-- Criar view unificada para busca com FTS em português
CREATE OR REPLACE VIEW app.search_unified AS
SELECT
  'field'::text as type,
  f.id,
  f.title,
  f.description,
  null::uuid as field_id,
  setweight(to_tsvector('portuguese', coalesce(f.title,'') || ' ' || coalesce(f.description,'')), 'A') as fts
FROM public.fields f
UNION ALL
SELECT
  'audio'::text as type,
  a.id,
  a.title,
  null as description,
  a.field_id,
  setweight(to_tsvector('portuguese', coalesce(a.title,'') || ' ' || coalesce(array_to_string(a.tags,' '),'')), 'B') as fts
FROM public.audios a;

-- Criar índice GIN para performance da busca
CREATE INDEX IF NOT EXISTS idx_search_unified_fts ON app.search_unified USING gin (fts);

-- RLS para a view (herda das tabelas base)
ALTER VIEW app.search_unified OWNER TO postgres;
GRANT SELECT ON app.search_unified TO authenticated, anon;