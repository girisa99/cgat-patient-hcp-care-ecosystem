-- Create TTS jobs table for background processing
-- This prevents WORKER_LIMIT errors by allowing async TTS generation

CREATE TABLE IF NOT EXISTS public.tts_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'complete', 'failed')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  text_length INTEGER,
  language_code TEXT,
  provider TEXT,
  zone TEXT,
  quality TEXT,
  cost DECIMAL(10, 4),
  char_count INTEGER,
  audio_content TEXT, -- Base64 encoded audio
  audio_url TEXT, -- Data URL for direct playback
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add index for fast job lookups
CREATE INDEX IF NOT EXISTS idx_tts_jobs_status ON public.tts_jobs(status);
CREATE INDEX IF NOT EXISTS idx_tts_jobs_created_at ON public.tts_jobs(created_at);

-- Enable RLS
ALTER TABLE public.tts_jobs ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (service role key is used in edge function)
CREATE POLICY "Allow all for service role" ON public.tts_jobs FOR ALL USING (true);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tts_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  IF NEW.status = 'complete' OR NEW.status = 'failed' THEN
    NEW.completed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_tts_jobs_updated_at
  BEFORE UPDATE ON public.tts_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_tts_jobs_updated_at();

-- Auto-cleanup old jobs (keep for 24 hours)
-- This can be run periodically via a scheduled function
COMMENT ON TABLE public.tts_jobs IS 'Stores async TTS job status for background processing. Jobs older than 24h can be cleaned up.';