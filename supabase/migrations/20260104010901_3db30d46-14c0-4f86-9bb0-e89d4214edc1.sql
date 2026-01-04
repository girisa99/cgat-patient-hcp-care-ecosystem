-- Create the genie-media storage bucket for voiceovers, TTS, and music files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'genie-media',
  'genie-media',
  true,
  52428800, -- 50MB limit
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/x-m4a', 'audio/mp4']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files to genie-media bucket
CREATE POLICY "Authenticated users can upload to genie-media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'genie-media');

-- Allow authenticated users to update their own files
CREATE POLICY "Users can update own files in genie-media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'genie-media' AND (storage.foldername(name))[2] = auth.uid()::text);

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete own files in genie-media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'genie-media' AND (storage.foldername(name))[2] = auth.uid()::text);

-- Allow public read access (bucket is public)
CREATE POLICY "Public read access for genie-media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'genie-media');