
-- H-705: Provision cast-assets storage bucket for Genie Cast pipeline
-- Claude's avatar pipeline (B-014) uploads generated videos here

-- Create the bucket (private by default, accessed via signed URLs)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cast-assets',
  'cast-assets',
  false,
  104857600, -- 100MB max per file (video files)
  ARRAY['video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav', 'image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- RLS: Users can upload to their own folder (cast-assets/{user_id}/*)
CREATE POLICY "Users can upload cast assets to own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'cast-assets'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS: Users can view their own assets
CREATE POLICY "Users can view own cast assets"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'cast-assets'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS: Users can update their own assets
CREATE POLICY "Users can update own cast assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'cast-assets'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS: Users can delete their own assets
CREATE POLICY "Users can delete own cast assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'cast-assets'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
