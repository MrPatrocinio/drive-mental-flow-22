-- Ativar o vídeo existente na landing page
UPDATE landing_content 
SET content = jsonb_set(
  content, 
  '{active_video_id}', 
  '"video_1754093630485"'
)
WHERE section = 'videos';