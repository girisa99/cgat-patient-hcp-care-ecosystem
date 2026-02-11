
-- =============================================
-- TTS Audio Versions Table — full generation history
-- Stores every TTS generation per script with provider/voice/locale metadata
-- Audio files stored in Supabase Storage, only URLs persisted here
-- =============================================
CREATE TABLE public.tts_audio_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  script_id UUID NOT NULL REFERENCES public.regional_narration_scripts(id) ON DELETE CASCADE,
  script_version_id UUID REFERENCES public.script_versions(id) ON DELETE SET NULL,
  version_number INTEGER NOT NULL DEFAULT 1,
  
  -- Sub-region routing metadata
  region_code TEXT NOT NULL,
  language_code TEXT NOT NULL DEFAULT 'en-US',
  
  -- Provider routing (what was actually used)
  tts_provider TEXT NOT NULL,
  tts_voice_id TEXT,
  tts_voice_name TEXT,
  tts_locale TEXT,
  tts_speed NUMERIC DEFAULT 1.0,
  tts_pitch TEXT,
  
  -- Generation result (URL to storage, NOT base64)
  audio_storage_path TEXT,
  audio_url TEXT,
  audio_duration_seconds NUMERIC,
  audio_format TEXT DEFAULT 'mp3',
  characters_processed INTEGER,
  
  -- Generation context
  generation_mode TEXT NOT NULL DEFAULT 'manual' CHECK (generation_mode IN ('auto', 'manual')),
  generation_trigger TEXT DEFAULT 'user_action',
  routing_zone TEXT,
  fallback_used BOOLEAN DEFAULT FALSE,
  fallback_from TEXT,
  
  -- Status and quality
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'generating', 'completed', 'failed', 'archived')),
  quality_score NUMERIC,
  error_message TEXT,
  
  -- Timestamps with month/year/date/time as requested
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  
  -- Ensure unique version per script
  UNIQUE(script_id, version_number)
);

-- Enable RLS
ALTER TABLE public.tts_audio_versions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view all TTS versions"
  ON public.tts_audio_versions FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert TTS versions"
  ON public.tts_audio_versions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update TTS versions"
  ON public.tts_audio_versions FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Index for fast lookups
CREATE INDEX idx_tts_audio_versions_script_id ON public.tts_audio_versions(script_id);
CREATE INDEX idx_tts_audio_versions_region ON public.tts_audio_versions(region_code);
CREATE INDEX idx_tts_audio_versions_generated_at ON public.tts_audio_versions(generated_at DESC);

-- Auto-increment version_number per script
CREATE OR REPLACE FUNCTION public.auto_increment_tts_version()
RETURNS TRIGGER AS $$
BEGIN
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO NEW.version_number
  FROM public.tts_audio_versions
  WHERE script_id = NEW.script_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_auto_increment_tts_version
  BEFORE INSERT ON public.tts_audio_versions
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_increment_tts_version();

-- =============================================
-- Extend script_improvement_notes for TTS feedback
-- Add optional tts_version_id FK
-- =============================================
ALTER TABLE public.script_improvement_notes
  ADD COLUMN tts_version_id UUID REFERENCES public.tts_audio_versions(id) ON DELETE SET NULL;

-- Add index for TTS feedback lookups
CREATE INDEX idx_script_improvement_notes_tts_version 
  ON public.script_improvement_notes(tts_version_id) 
  WHERE tts_version_id IS NOT NULL;

-- Comment for documentation
COMMENT ON TABLE public.tts_audio_versions IS 'Stores every TTS audio generation with full provider/voice/locale metadata. Audio files in Supabase Storage, only URLs here.';
COMMENT ON COLUMN public.script_improvement_notes.tts_version_id IS 'Optional FK to tts_audio_versions for TTS-specific feedback (note_type=tts_feedback)';
