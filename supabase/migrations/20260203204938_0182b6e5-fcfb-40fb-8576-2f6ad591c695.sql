-- Ensure genie-media bucket exists and is public (for TTS audio files)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('genie-media', 'genie-media', true, 52428800)
ON CONFLICT (id) DO UPDATE SET public = true;