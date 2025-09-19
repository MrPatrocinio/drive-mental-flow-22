-- Criar função RPC para busca unificada
CREATE OR REPLACE FUNCTION search_unified_content(search_query text)
RETURNS TABLE(
  type text,
  id uuid,
  title text,
  description text,
  field_id uuid
) 
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    s.type,
    s.id,
    s.title,
    s.description,
    s.field_id
  FROM app.search_unified s
  WHERE s.fts @@ websearch_to_tsquery('portuguese', search_query)
  ORDER BY ts_rank(s.fts, websearch_to_tsquery('portuguese', search_query)) DESC, s.title
  LIMIT 20;
$$;