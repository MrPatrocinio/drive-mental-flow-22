
-- Criar bucket para vídeos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  true,
  52428800, -- 50MB em bytes
  ARRAY['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm']
);

-- Política para permitir que admins façam upload de vídeos
CREATE POLICY "Admin can upload videos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'videos' AND
    auth.uid() IN (
      SELECT user_id FROM public.profiles WHERE role = 'admin'
    )
  );

-- Política para permitir leitura pública dos vídeos
CREATE POLICY "Anyone can view videos" ON storage.objects
  FOR SELECT USING (bucket_id = 'videos');

-- Política para permitir que admins atualizem vídeos
CREATE POLICY "Admin can update videos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'videos' AND
    auth.uid() IN (
      SELECT user_id FROM public.profiles WHERE role = 'admin'
    )
  );

-- Política para permitir que admins excluam vídeos
CREATE POLICY "Admin can delete videos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'videos' AND
    auth.uid() IN (
      SELECT user_id FROM public.profiles WHERE role = 'admin'
    )
  );
