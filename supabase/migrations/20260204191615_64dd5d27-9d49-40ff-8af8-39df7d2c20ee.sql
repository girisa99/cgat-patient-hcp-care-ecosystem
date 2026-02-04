-- Create thumbnail generation queue for async processing
CREATE TABLE IF NOT EXISTS public.thumbnail_generation_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blueprint_id UUID REFERENCES public.video_blueprints(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  provider TEXT,
  region TEXT DEFAULT 'global',
  thumbnail_url TEXT,
  error_message TEXT,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.thumbnail_generation_queue ENABLE ROW LEVEL SECURITY;

-- Public read access for status polling
CREATE POLICY "Allow public read access for queue status"
  ON public.thumbnail_generation_queue FOR SELECT
  USING (true);

-- Allow authenticated users to insert jobs
CREATE POLICY "Allow authenticated insert queue jobs"
  ON public.thumbnail_generation_queue FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow updates (for background processing)
CREATE POLICY "Allow updates to queue"
  ON public.thumbnail_generation_queue FOR UPDATE
  USING (true);

-- Add columns to video_blueprints for expanded metadata
ALTER TABLE public.video_blueprints 
  ADD COLUMN IF NOT EXISTS thumbnail_provider TEXT,
  ADD COLUMN IF NOT EXISTS thumbnail_region TEXT DEFAULT 'global',
  ADD COLUMN IF NOT EXISTS ai_capabilities JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS regional_variants JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS primary_model TEXT,
  ADD COLUMN IF NOT EXISTS secondary_models TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS capability_tags TEXT[] DEFAULT '{}';

-- Create index for quick filtering
CREATE INDEX IF NOT EXISTS idx_blueprints_capability_tags ON public.video_blueprints USING GIN(capability_tags);
CREATE INDEX IF NOT EXISTS idx_blueprints_category ON public.video_blueprints(category);
CREATE INDEX IF NOT EXISTS idx_queue_status ON public.thumbnail_generation_queue(status);

COMMENT ON TABLE public.thumbnail_generation_queue IS 'Async queue for thumbnail generation to avoid Edge Function timeouts';
COMMENT ON COLUMN public.video_blueprints.ai_capabilities IS 'List of AI capabilities: text_to_video, video_to_video, lipsync, avatar, etc.';
COMMENT ON COLUMN public.video_blueprints.regional_variants IS 'Regional thumbnail URLs: {cjk: url, mena: url, western: url}';