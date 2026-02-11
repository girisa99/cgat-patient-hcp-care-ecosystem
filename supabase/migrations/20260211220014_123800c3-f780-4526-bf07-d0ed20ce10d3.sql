-- Narration playback analytics events table
-- Maps to Cast 'analytics' category, pipeline: narration-playback-track
CREATE TABLE public.narration_playback_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- What was played
  script_id UUID REFERENCES public.regional_narration_scripts(id),
  tts_audio_id UUID REFERENCES public.tts_audio_versions(id),
  region_code TEXT NOT NULL,
  sub_region_code TEXT,
  language_code TEXT,
  -- Playback metrics
  event_type TEXT NOT NULL DEFAULT 'play', -- play, pause, complete, error
  playback_duration_ms INTEGER, -- how long user listened
  total_audio_duration_ms INTEGER, -- full audio length
  completion_percentage NUMERIC(5,2), -- 0.00 to 100.00
  -- Visitor context
  visitor_session_id TEXT, -- anonymous session tracking
  visitor_country TEXT,
  visitor_device_type TEXT, -- mobile, desktop, tablet
  visitor_browser TEXT,
  referrer_url TEXT,
  landing_page_path TEXT,
  -- Source tracking
  pipeline_category TEXT NOT NULL DEFAULT 'analytics',
  pipeline_id TEXT NOT NULL DEFAULT 'narration-playback-track',
  -- Provider info
  tts_provider TEXT,
  tts_voice_id TEXT,
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.narration_playback_events ENABLE ROW LEVEL SECURITY;

-- Public insert policy (anonymous visitors can log playback events)
CREATE POLICY "Anyone can log playback events"
  ON public.narration_playback_events
  FOR INSERT
  WITH CHECK (true);

-- Only authenticated users can read analytics
CREATE POLICY "Authenticated users can read playback events"
  ON public.narration_playback_events
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Indexes for analytics queries
CREATE INDEX idx_playback_region ON public.narration_playback_events(region_code, created_at DESC);
CREATE INDEX idx_playback_script ON public.narration_playback_events(script_id, created_at DESC);
CREATE INDEX idx_playback_event_type ON public.narration_playback_events(event_type, created_at DESC);
CREATE INDEX idx_playback_date ON public.narration_playback_events(created_at DESC);

-- Regional engagement summary view
CREATE OR REPLACE VIEW public.narration_playback_summary AS
SELECT 
  region_code,
  sub_region_code,
  language_code,
  tts_provider,
  COUNT(*) FILTER (WHERE event_type = 'play') AS total_plays,
  COUNT(*) FILTER (WHERE event_type = 'complete') AS total_completions,
  AVG(completion_percentage) FILTER (WHERE completion_percentage IS NOT NULL) AS avg_completion_pct,
  AVG(playback_duration_ms) FILTER (WHERE playback_duration_ms IS NOT NULL) AS avg_listen_ms,
  COUNT(DISTINCT visitor_session_id) AS unique_listeners,
  COUNT(DISTINCT DATE(created_at)) AS active_days,
  MAX(created_at) AS last_played_at
FROM public.narration_playback_events
GROUP BY region_code, sub_region_code, language_code, tts_provider;