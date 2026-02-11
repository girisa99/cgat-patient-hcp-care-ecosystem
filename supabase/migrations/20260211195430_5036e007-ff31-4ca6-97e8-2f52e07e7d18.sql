-- Create storage bucket for TTS audio files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('tts-audio', 'tts-audio', true, 52428800, ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'])
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "TTS audio files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'tts-audio');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload TTS audio"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'tts-audio' AND auth.role() = 'authenticated');

-- Allow service role to upload (edge functions)
CREATE POLICY "Service role can manage TTS audio"
ON storage.objects FOR ALL
USING (bucket_id = 'tts-audio')
WITH CHECK (bucket_id = 'tts-audio');