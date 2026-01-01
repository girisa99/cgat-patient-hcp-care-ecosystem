-- Allow anyone to upload to generated-videos bucket (public bucket for recordings)
CREATE POLICY "Anyone can upload videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'generated-videos');

-- Allow anyone to update videos (for upsert)
CREATE POLICY "Anyone can update videos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'generated-videos');

-- Allow public insert to generated_media for popout recordings
DROP POLICY IF EXISTS "Users can insert their own media" ON public.generated_media;

CREATE POLICY "Anyone can insert media"
ON public.generated_media FOR INSERT
WITH CHECK (true);

-- Keep select restricted to own media
-- (existing policy: Users can view their own media)