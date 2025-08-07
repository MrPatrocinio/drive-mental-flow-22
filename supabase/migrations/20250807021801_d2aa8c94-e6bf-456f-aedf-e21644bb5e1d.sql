-- Adicionar coluna display_order na tabela fields
ALTER TABLE public.fields 
ADD COLUMN display_order INTEGER NOT NULL DEFAULT 0;

-- Atualizar display_order com base na ordem atual (created_at)
UPDATE public.fields 
SET display_order = subquery.row_number 
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_number 
  FROM public.fields
) AS subquery 
WHERE public.fields.id = subquery.id;

-- Criar índice para performance
CREATE INDEX idx_fields_display_order ON public.fields(display_order);

-- Trigger para manter display_order únicos em novos inserts
CREATE OR REPLACE FUNCTION set_field_display_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Se display_order não foi definido, colocar no final
  IF NEW.display_order = 0 OR NEW.display_order IS NULL THEN
    NEW.display_order = (SELECT COALESCE(MAX(display_order), 0) + 1 FROM public.fields);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_field_display_order
  BEFORE INSERT ON public.fields
  FOR EACH ROW
  EXECUTE FUNCTION set_field_display_order();