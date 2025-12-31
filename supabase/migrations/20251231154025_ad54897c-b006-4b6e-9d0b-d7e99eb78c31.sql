-- Create storage bucket for generated audio files
INSERT INTO storage.buckets (id, name, public)
VALUES ('generated-audio', 'generated-audio', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload audio
CREATE POLICY "Authenticated users can upload audio"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'generated-audio' AND auth.uid() IS NOT NULL);

-- Allow authenticated users to view their audio
CREATE POLICY "Authenticated users can view audio"
ON storage.objects FOR SELECT
USING (bucket_id = 'generated-audio');

-- Allow authenticated users to delete their audio
CREATE POLICY "Authenticated users can delete audio"
ON storage.objects FOR DELETE
USING (bucket_id = 'generated-audio' AND auth.uid() IS NOT NULL);