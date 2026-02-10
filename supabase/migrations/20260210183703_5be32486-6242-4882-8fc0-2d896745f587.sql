-- TTS Audio Cache for hero voiceover
-- Stores generated audio so subsequent plays use cached version
CREATE TABLE public.tts_audio_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT NOT NULL UNIQUE, -- e.g. "nam_platform_en-US" or hash of text+lang
  region_slug TEXT NOT NULL,
  slide_id TEXT NOT NULL,
  lang_code TEXT NOT NULL,
  audio_base64 TEXT NOT NULL,
  text_hash TEXT NOT NULL, -- SHA256 of the source text to detect staleness
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '30 days')
);

-- Enable RLS (public read for landing page, no writes from client)
ALTER TABLE public.tts_audio_cache ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read cached audio (public landing page)
CREATE POLICY "Anyone can read TTS cache"
  ON public.tts_audio_cache
  FOR SELECT
  USING (true);

-- Allow service role to insert/update (edge functions only)
CREATE POLICY "Service role can manage TTS cache"
  ON public.tts_audio_cache
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Index for fast lookups
CREATE INDEX idx_tts_audio_cache_key ON public.tts_audio_cache (cache_key);
CREATE INDEX idx_tts_audio_cache_region ON public.tts_audio_cache (region_slug, slide_id, lang_code);