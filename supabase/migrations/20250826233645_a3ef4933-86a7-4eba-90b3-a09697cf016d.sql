
-- Corrigir URL do áudio demo "Prosperidade Pessoal" 
-- Usar a URL de um áudio que sabemos que funciona
UPDATE audios 
SET url = (
  SELECT url 
  FROM audios 
  WHERE title = 'Abundância Natural' 
  AND url IS NOT NULL 
  AND url != ''
  LIMIT 1
)
WHERE title = 'Prosperidade Pessoal' 
AND is_demo = true 
AND (url IS NULL OR url = '');

-- Verificar se a atualização foi bem-sucedida
SELECT title, url, is_demo 
FROM audios 
WHERE is_demo = true;
