
-- Corrigir o áudio de demonstração atual com URL vazia
-- Vamos usar a URL do áudio "Prosperidade Própria" que está funcionando
UPDATE public.audios 
SET url = 'https://ipdzkzlrcyrcfwvhiulc.supabase.co/storage/v1/object/public/audios/1754075494045-7rz6wo.mp3'
WHERE is_demo = true AND (url = '' OR url IS NULL);

-- Verificar se a atualização foi bem-sucedida
-- Se não houver áudio demo com URL vazia, marcar "Prosperidade Própria" como demo
DO $$
BEGIN
  -- Se não existe nenhum áudio demo após a atualização acima
  IF NOT EXISTS (SELECT 1 FROM public.audios WHERE is_demo = true AND url != '' AND url IS NOT NULL) THEN
    -- Primeiro, desmarcar qualquer áudio como demo
    UPDATE public.audios SET is_demo = false WHERE is_demo = true;
    
    -- Marcar "Prosperidade Própria" como demo (usando a URL como identificador)
    UPDATE public.audios 
    SET is_demo = true 
    WHERE url = 'https://ipdzkzlrcyrcfwvhiulc.supabase.co/storage/v1/object/public/audios/1754075494045-7rz6wo.mp3'
    LIMIT 1;
  END IF;
END $$;
