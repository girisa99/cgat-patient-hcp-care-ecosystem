-- Pipeline Feedback Table for Confidence Loop & RLHF
-- Required by ConfidenceLoopEngine.ts for Label Studio sync

CREATE TABLE IF NOT EXISTS public.pipeline_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id TEXT NOT NULL,
  confidence_score NUMERIC(5,4) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  iterations_used INTEGER NOT NULL DEFAULT 1,
  provider_used TEXT NOT NULL,
  input_hash TEXT NOT NULL,
  quality_issues JSONB DEFAULT '{}',
  feedback_type TEXT CHECK (feedback_type IN ('auto', 'user_thumbs', 'user_detailed', 'label_studio')),
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  user_feedback TEXT,
  generation_output_preview TEXT,
  generation_duration_ms INTEGER,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  label_studio_task_id TEXT,
  synced_to_label_studio BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pipeline_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own feedback"
  ON public.pipeline_feedback FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create feedback"
  ON public.pipeline_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Service role can manage all feedback"
  ON public.pipeline_feedback FOR ALL
  USING (auth.role() = 'service_role');

-- Indexes for performance
CREATE INDEX idx_pipeline_feedback_pipeline_id ON public.pipeline_feedback(pipeline_id);
CREATE INDEX idx_pipeline_feedback_confidence ON public.pipeline_feedback(confidence_score);
CREATE INDEX idx_pipeline_feedback_created_at ON public.pipeline_feedback(created_at DESC);
CREATE INDEX idx_pipeline_feedback_user ON public.pipeline_feedback(user_id);
CREATE INDEX idx_pipeline_feedback_label_studio ON public.pipeline_feedback(synced_to_label_studio) WHERE synced_to_label_studio = FALSE;

-- Trigger for updated_at
CREATE TRIGGER update_pipeline_feedback_updated_at
  BEFORE UPDATE ON public.pipeline_feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Media Assets Table for file storage and versioning
CREATE TABLE IF NOT EXISTS public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('original', 'version', 'draft', 'export')),
  file_type TEXT NOT NULL, -- mp4, mp3, pdf, pptx, etc.
  storage_path TEXT NOT NULL,
  file_size_bytes BIGINT,
  duration_seconds NUMERIC,
  resolution TEXT, -- e.g., "1920x1080"
  thumbnail_url TEXT,
  metadata JSONB DEFAULT '{}',
  version_number INTEGER DEFAULT 1,
  parent_asset_id UUID REFERENCES public.media_assets(id) ON DELETE SET NULL,
  pipeline_id TEXT, -- Which pipeline generated this
  confidence_score NUMERIC(5,4),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own assets"
  ON public.media_assets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assets"
  ON public.media_assets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assets"
  ON public.media_assets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assets"
  ON public.media_assets FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_media_assets_user ON public.media_assets(user_id);
CREATE INDEX idx_media_assets_project ON public.media_assets(project_id);
CREATE INDEX idx_media_assets_type ON public.media_assets(type);
CREATE INDEX idx_media_assets_parent ON public.media_assets(parent_asset_id);

-- Trigger for updated_at
CREATE TRIGGER update_media_assets_updated_at
  BEFORE UPDATE ON public.media_assets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON TABLE public.pipeline_feedback IS 'Stores confidence scores and feedback for RLHF training via Label Studio';
COMMENT ON TABLE public.media_assets IS 'Tracks all media files with version history (original vs iterations)';