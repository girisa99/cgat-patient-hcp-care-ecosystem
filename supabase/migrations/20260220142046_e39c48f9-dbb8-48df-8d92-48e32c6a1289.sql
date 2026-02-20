
-- Cast Projects table — tracks production sessions with token/cost accumulation
CREATE TABLE public.cast_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  team_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT,
  blueprint_id TEXT,
  style_intent TEXT NOT NULL DEFAULT 'cinematic',
  selected_styles TEXT[] NOT NULL DEFAULT '{}',
  selected_capabilities TEXT[] NOT NULL DEFAULT '{}',
  target_regions TEXT[] NOT NULL DEFAULT '{global}',
  selected_dialects TEXT[] NOT NULL DEFAULT '{en-US}',
  intent_value TEXT,
  product_context TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  current_stage TEXT NOT NULL DEFAULT 'template_selection',
  completed_stages TEXT[] NOT NULL DEFAULT '{}',
  estimated_tokens INTEGER NOT NULL DEFAULT 0,
  actual_tokens_used INTEGER NOT NULL DEFAULT 0,
  quality TEXT NOT NULL DEFAULT 'preview',
  full_production_mode BOOLEAN NOT NULL DEFAULT false,
  production_config JSONB NOT NULL DEFAULT '{}',
  final_video_url TEXT,
  thumbnail_url TEXT,
  total_duration_seconds NUMERIC,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cast Generation Jobs table — per-step token/cost tracking
CREATE TABLE public.cast_generation_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.cast_projects(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL DEFAULT 'video',
  language TEXT NOT NULL DEFAULT 'en',
  product_id TEXT,
  tier TEXT,
  quality TEXT NOT NULL DEFAULT 'preview',
  style_intent TEXT,
  provider TEXT,
  provider_job_id TEXT,
  fallback_provider TEXT,
  status TEXT NOT NULL DEFAULT 'queued',
  progress_percent INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  output_url TEXT,
  output_thumbnail_url TEXT,
  output_duration_seconds NUMERIC,
  output_file_size_bytes BIGINT,
  estimated_tokens INTEGER NOT NULL DEFAULT 0,
  actual_tokens_used INTEGER NOT NULL DEFAULT 0,
  estimated_cost_usd NUMERIC NOT NULL DEFAULT 0,
  queued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  input_config JSONB NOT NULL DEFAULT '{}',
  output_metadata JSONB NOT NULL DEFAULT '{}',
  scene_key TEXT,
  line_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cast_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cast_generation_jobs ENABLE ROW LEVEL SECURITY;

-- RLS: Users can only access their own cast projects
CREATE POLICY "Users manage own cast projects" ON public.cast_projects
  FOR ALL USING (auth.uid() = user_id);

-- RLS: Users can access jobs for their own projects
CREATE POLICY "Users manage own cast jobs" ON public.cast_generation_jobs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.cast_projects
      WHERE cast_projects.id = cast_generation_jobs.project_id
        AND cast_projects.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_cast_projects_user ON public.cast_projects(user_id);
CREATE INDEX idx_cast_projects_status ON public.cast_projects(status);
CREATE INDEX idx_cast_jobs_project ON public.cast_generation_jobs(project_id);
CREATE INDEX idx_cast_jobs_status ON public.cast_generation_jobs(status);
CREATE INDEX idx_cast_jobs_scene ON public.cast_generation_jobs(project_id, scene_key);

-- Updated_at trigger
CREATE TRIGGER update_cast_projects_updated_at
  BEFORE UPDATE ON public.cast_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cast_jobs_updated_at
  BEFORE UPDATE ON public.cast_generation_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
