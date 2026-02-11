-- Clean up old TTS versions that have data URI audio (pre-storage-migration)
-- These cause "failed to play" errors due to size limits
DELETE FROM public.tts_audio_versions WHERE audio_url LIKE 'data:audio%';