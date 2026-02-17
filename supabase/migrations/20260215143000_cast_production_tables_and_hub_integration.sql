-- ============================================================================
-- Cast Production Tables + Hub/Arc Integration
--
-- Adds the production workflow tables that back the Genie Cast CREATE flow:
-- cast_projects, cast_messaging_content, cast_scene_scripts,
-- cast_generation_jobs, and show_cast_links (Hub/Arc integration).
--
-- Depends on: cast_video_styles, cast_ai_capabilities (migration 20260213224901)
--             shows (existing), genie_studio_teams/team_members (existing)
--             video_blueprints, blueprint_scenes (existing)
-- ============================================================================

-- ============================================
-- 1. ENUMS
-- ============================================

CREATE TYPE public.cast_project_status AS ENUM (
  'draft',
  'messaging_ready',
  'scripted',
  'generating',
  'review',
  'approved',
  'published',
  'archived'
);

CREATE TYPE public.cast_job_status AS ENUM (
  'queued',
  'processing',
  'rendering',
  'completed',
  'failed',
  'cancelled'
);

CREATE TYPE public.cast_approval_status AS ENUM (
  'draft',
  'pending',
  'approved',
  'rejected',
  'revision_requested'
);

-- ============================================
-- 2. TABLES
-- ============================================

-- 2A. cast_projects — Central project table linking user sessions to all assets
CREATE TABLE public.cast_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.genie_studio_teams(id) ON DELETE SET NULL,

  -- Project identity
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE,

  -- CREATE stage selections (mirrors useGenieCastSession state)
  blueprint_id UUID REFERENCES public.video_blueprints(id) ON DELETE SET NULL,
  style_intent TEXT DEFAULT 'corporate',
  selected_styles TEXT[] DEFAULT '{}',
  selected_capabilities TEXT[] DEFAULT '{}',

  -- Regional configuration
  target_regions TEXT[] DEFAULT ARRAY['global'],
  selected_dialects TEXT[] DEFAULT ARRAY['en-US'],

  -- Intent/Product context
  intent_value TEXT,
  product_context TEXT,

  -- Lifecycle
  status public.cast_project_status NOT NULL DEFAULT 'draft',
  current_stage TEXT DEFAULT 'template_selection',
  completed_stages TEXT[] DEFAULT '{}',

  -- Token usage
  estimated_tokens INTEGER DEFAULT 0,
  actual_tokens_used INTEGER DEFAULT 0,

  -- Quality settings
  quality TEXT DEFAULT 'production' CHECK (quality IN ('preview', 'production', 'cinematic')),
  full_production_mode BOOLEAN DEFAULT false,
  production_config JSONB DEFAULT '{}',

  -- Output
  final_video_url TEXT,
  thumbnail_url TEXT,
  total_duration_seconds INTEGER,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2B. cast_messaging_content — Approved messaging per project
CREATE TABLE public.cast_messaging_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.cast_projects(id) ON DELETE CASCADE,

  -- Messaging fields (matches MessagingContent interface)
  product_id TEXT,
  language TEXT NOT NULL DEFAULT 'en',

  -- Core messaging
  hook TEXT,
  sub_hook TEXT,
  value_proposition TEXT,
  headline TEXT,

  -- Lists (stored as JSONB arrays)
  pain_points JSONB DEFAULT '[]',
  benefits JSONB DEFAULT '[]',
  differentiators JSONB DEFAULT '[]',

  -- CTAs
  cta TEXT,
  cta_secondary TEXT,

  -- Script variants
  opening_line TEXT,
  closing_line TEXT,
  transition_phrases JSONB DEFAULT '[]',
  short_script TEXT,
  medium_script TEXT,
  long_script TEXT,

  -- Approval
  approval_status public.cast_approval_status NOT NULL DEFAULT 'draft',
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Version tracking
  version INTEGER NOT NULL DEFAULT 1,
  parent_version_id UUID REFERENCES public.cast_messaging_content(id),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2C. cast_scene_scripts — Per-scene script content with TTS config
CREATE TABLE public.cast_scene_scripts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.cast_projects(id) ON DELETE CASCADE,

  -- Scene identification
  scene_id UUID REFERENCES public.blueprint_scenes(id) ON DELETE SET NULL,
  scene_key TEXT NOT NULL,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,

  -- Script content
  script_text TEXT NOT NULL,
  edited_text TEXT,
  source_type TEXT DEFAULT 'messaging' CHECK (source_type IN ('messaging', 'template', 'custom')),

  -- Timing
  duration_seconds INTEGER DEFAULT 10,
  min_duration INTEGER DEFAULT 5,
  max_duration INTEGER DEFAULT 30,

  -- TTS configuration (matches SceneScript.ttsConfig)
  tts_provider TEXT DEFAULT 'azure-neural',
  tts_voice_id TEXT,
  tts_speed NUMERIC(3,2) DEFAULT 1.00,
  tts_pitch NUMERIC(3,2) DEFAULT 1.00,

  -- Generated audio
  audio_url TEXT,
  audio_duration_seconds NUMERIC(8,2),

  -- Approval
  approval_status public.cast_approval_status NOT NULL DEFAULT 'draft',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(project_id, scene_key)
);

-- 2D. cast_generation_jobs — Track video generation jobs
CREATE TABLE public.cast_generation_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.cast_projects(id) ON DELETE CASCADE,

  -- Job identification
  job_type TEXT NOT NULL DEFAULT 'video' CHECK (job_type IN ('video', 'tts', 'avatar', 'animation', '3d', 'image', 'thumbnail')),

  -- Input parameters
  language TEXT NOT NULL DEFAULT 'en',
  product_id TEXT,
  tier TEXT,
  quality TEXT DEFAULT 'production',
  style_intent TEXT,

  -- Provider tracking
  provider TEXT,
  provider_job_id TEXT,
  fallback_provider TEXT,

  -- Status
  status public.cast_job_status NOT NULL DEFAULT 'queued',
  progress_percent INTEGER DEFAULT 0,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,

  -- Output
  output_url TEXT,
  output_thumbnail_url TEXT,
  output_duration_seconds NUMERIC(8,2),
  output_file_size_bytes BIGINT,

  -- Cost tracking
  estimated_tokens INTEGER DEFAULT 0,
  actual_tokens_used INTEGER DEFAULT 0,
  estimated_cost_usd NUMERIC(10,4) DEFAULT 0,

  -- Timing
  queued_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Metadata
  input_config JSONB DEFAULT '{}',
  output_metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2E. show_cast_links — Links Hub/Arc shows to Cast projects
CREATE TABLE public.show_cast_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  show_id UUID NOT NULL REFERENCES public.shows(id) ON DELETE CASCADE,
  cast_project_id UUID NOT NULL REFERENCES public.cast_projects(id) ON DELETE CASCADE,

  -- Link metadata
  link_type TEXT NOT NULL DEFAULT 'publish' CHECK (link_type IN ('publish', 'promo', 'trailer', 'clip', 'recording')),

  -- Show stage context
  linked_at_stage TEXT,

  -- Publishing config
  publish_platforms TEXT[] DEFAULT '{}',
  scheduled_publish_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Who created the link
  created_by UUID REFERENCES auth.users(id),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(show_id, cast_project_id, link_type)
);

-- ============================================
-- 3. INDEXES
-- ============================================

-- cast_projects
CREATE INDEX idx_cast_projects_user ON public.cast_projects(user_id);
CREATE INDEX idx_cast_projects_team ON public.cast_projects(team_id) WHERE team_id IS NOT NULL;
CREATE INDEX idx_cast_projects_status ON public.cast_projects(status);
CREATE INDEX idx_cast_projects_blueprint ON public.cast_projects(blueprint_id) WHERE blueprint_id IS NOT NULL;
CREATE INDEX idx_cast_projects_intent ON public.cast_projects(intent_value) WHERE intent_value IS NOT NULL;

-- cast_messaging_content
CREATE INDEX idx_cast_messaging_project ON public.cast_messaging_content(project_id);
CREATE INDEX idx_cast_messaging_approval ON public.cast_messaging_content(approval_status);

-- cast_scene_scripts
CREATE INDEX idx_cast_scenes_project ON public.cast_scene_scripts(project_id, order_index);
CREATE INDEX idx_cast_scenes_scene ON public.cast_scene_scripts(scene_id) WHERE scene_id IS NOT NULL;

-- cast_generation_jobs
CREATE INDEX idx_cast_jobs_project ON public.cast_generation_jobs(project_id);
CREATE INDEX idx_cast_jobs_status ON public.cast_generation_jobs(status);
CREATE INDEX idx_cast_jobs_provider_job ON public.cast_generation_jobs(provider_job_id) WHERE provider_job_id IS NOT NULL;
CREATE INDEX idx_cast_jobs_queued ON public.cast_generation_jobs(queued_at) WHERE status IN ('queued', 'processing', 'rendering');

-- show_cast_links
CREATE INDEX idx_show_cast_links_show ON public.show_cast_links(show_id);
CREATE INDEX idx_show_cast_links_project ON public.show_cast_links(cast_project_id);
CREATE INDEX idx_show_cast_links_scheduled ON public.show_cast_links(scheduled_publish_at) WHERE scheduled_publish_at IS NOT NULL;

-- ============================================
-- 4. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.cast_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cast_messaging_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cast_scene_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cast_generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.show_cast_links ENABLE ROW LEVEL SECURITY;

-- ── cast_projects ──────────────────────────────────────────────────────

CREATE POLICY "Users can view own cast projects"
  ON public.cast_projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Team members can view team cast projects"
  ON public.cast_projects FOR SELECT
  USING (
    team_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.genie_studio_team_members tm
      WHERE tm.team_id = cast_projects.team_id
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create cast projects"
  ON public.cast_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cast projects"
  ON public.cast_projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Team admins can update team cast projects"
  ON public.cast_projects FOR UPDATE
  USING (
    team_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.genie_studio_team_members tm
      WHERE tm.team_id = cast_projects.team_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can delete own cast projects"
  ON public.cast_projects FOR DELETE
  USING (auth.uid() = user_id);

-- ── cast_messaging_content (inherits via project) ──────────────────────

CREATE POLICY "Users can view messaging for accessible projects"
  ON public.cast_messaging_content FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cast_projects cp
      WHERE cp.id = project_id
      AND (
        cp.user_id = auth.uid()
        OR (cp.team_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.genie_studio_team_members tm
          WHERE tm.team_id = cp.team_id AND tm.user_id = auth.uid()
        ))
      )
    )
  );

CREATE POLICY "Users can insert messaging for own projects"
  ON public.cast_messaging_content FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cast_projects cp
      WHERE cp.id = project_id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update messaging for own projects"
  ON public.cast_messaging_content FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.cast_projects cp
      WHERE cp.id = project_id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete messaging for own projects"
  ON public.cast_messaging_content FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.cast_projects cp
      WHERE cp.id = project_id AND cp.user_id = auth.uid()
    )
  );

-- ── cast_scene_scripts (inherits via project) ──────────────────────────

CREATE POLICY "Users can view scene scripts for accessible projects"
  ON public.cast_scene_scripts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cast_projects cp
      WHERE cp.id = project_id
      AND (
        cp.user_id = auth.uid()
        OR (cp.team_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.genie_studio_team_members tm
          WHERE tm.team_id = cp.team_id AND tm.user_id = auth.uid()
        ))
      )
    )
  );

CREATE POLICY "Users can insert scene scripts for own projects"
  ON public.cast_scene_scripts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cast_projects cp
      WHERE cp.id = project_id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update scene scripts for own projects"
  ON public.cast_scene_scripts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.cast_projects cp
      WHERE cp.id = project_id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete scene scripts for own projects"
  ON public.cast_scene_scripts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.cast_projects cp
      WHERE cp.id = project_id AND cp.user_id = auth.uid()
    )
  );

-- ── cast_generation_jobs (inherits via project) ────────────────────────

CREATE POLICY "Users can view generation jobs for accessible projects"
  ON public.cast_generation_jobs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cast_projects cp
      WHERE cp.id = project_id
      AND (
        cp.user_id = auth.uid()
        OR (cp.team_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.genie_studio_team_members tm
          WHERE tm.team_id = cp.team_id AND tm.user_id = auth.uid()
        ))
      )
    )
  );

CREATE POLICY "Users can insert generation jobs for own projects"
  ON public.cast_generation_jobs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cast_projects cp
      WHERE cp.id = project_id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update generation jobs for own projects"
  ON public.cast_generation_jobs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.cast_projects cp
      WHERE cp.id = project_id AND cp.user_id = auth.uid()
    )
  );

-- ── show_cast_links ────────────────────────────────────────────────────

CREATE POLICY "Users can view their show-cast links"
  ON public.show_cast_links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.shows s
      WHERE s.id = show_id AND s.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.cast_projects cp
      WHERE cp.id = cast_project_id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create show-cast links for own shows"
  ON public.show_cast_links FOR INSERT
  WITH CHECK (
    auth.uid() = created_by
    AND EXISTS (
      SELECT 1 FROM public.shows s
      WHERE s.id = show_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own show-cast links"
  ON public.show_cast_links FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete own show-cast links"
  ON public.show_cast_links FOR DELETE
  USING (created_by = auth.uid());

-- ── Admin write policies for cast registry tables ──────────────────────

CREATE POLICY "Admins can manage cast_video_styles"
  ON public.cast_video_styles FOR ALL
  USING (
    public.has_genie_studio_role(auth.uid(), 'super_admin')
    OR public.has_genie_studio_role(auth.uid(), 'content_manager')
  );

CREATE POLICY "Admins can manage cast_ai_capabilities"
  ON public.cast_ai_capabilities FOR ALL
  USING (
    public.has_genie_studio_role(auth.uid(), 'super_admin')
    OR public.has_genie_studio_role(auth.uid(), 'content_manager')
  );

CREATE POLICY "Admins can manage cast_style_capability_map"
  ON public.cast_style_capability_map FOR ALL
  USING (
    public.has_genie_studio_role(auth.uid(), 'super_admin')
    OR public.has_genie_studio_role(auth.uid(), 'content_manager')
  );

CREATE POLICY "Admins can manage cast_capability_provider_map"
  ON public.cast_capability_provider_map FOR ALL
  USING (
    public.has_genie_studio_role(auth.uid(), 'super_admin')
    OR public.has_genie_studio_role(auth.uid(), 'content_manager')
  );

CREATE POLICY "Admins can manage cast_style_platform_map"
  ON public.cast_style_platform_map FOR ALL
  USING (
    public.has_genie_studio_role(auth.uid(), 'super_admin')
    OR public.has_genie_studio_role(auth.uid(), 'content_manager')
  );

CREATE POLICY "Admins can manage cast_intent_style_map"
  ON public.cast_intent_style_map FOR ALL
  USING (
    public.has_genie_studio_role(auth.uid(), 'super_admin')
    OR public.has_genie_studio_role(auth.uid(), 'content_manager')
  );

-- ============================================
-- 5. TRIGGERS
-- ============================================

CREATE TRIGGER update_cast_projects_updated_at
  BEFORE UPDATE ON public.cast_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cast_messaging_content_updated_at
  BEFORE UPDATE ON public.cast_messaging_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cast_scene_scripts_updated_at
  BEFORE UPDATE ON public.cast_scene_scripts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cast_generation_jobs_updated_at
  BEFORE UPDATE ON public.cast_generation_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_show_cast_links_updated_at
  BEFORE UPDATE ON public.show_cast_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-generate slug for cast_projects
CREATE OR REPLACE FUNCTION public.generate_cast_project_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(NEW.id::text, 1, 8);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_generate_cast_project_slug
  BEFORE INSERT ON public.cast_projects
  FOR EACH ROW EXECUTE FUNCTION public.generate_cast_project_slug();

-- ============================================
-- 6. DATABASE FUNCTIONS
-- ============================================

-- 6A. Token cost estimation (server-side, mirrors useCastRegistry.estimateTokens)
CREATE OR REPLACE FUNCTION public.estimate_cast_tokens(
  p_style_values TEXT[],
  p_capability_values TEXT[],
  p_platform_count INTEGER DEFAULT 1,
  p_region_count INTEGER DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_base_tokens INTEGER := 0;
  v_breakdown JSONB := '[]'::JSONB;
  v_map RECORD;
  v_cap_tokens INTEGER;
  v_platform_multiplier NUMERIC;
  v_region_multiplier NUMERIC;
  v_total INTEGER;
  v_tier TEXT;
BEGIN
  FOR v_map IN
    SELECT DISTINCT ON (scm.capability_value)
      scm.capability_value,
      scm.is_required,
      scm.token_multiplier,
      ac.base_token_cost,
      ac.label AS cap_label
    FROM cast_style_capability_map scm
    JOIN cast_ai_capabilities ac ON ac.value = scm.capability_value
    WHERE scm.style_value = ANY(p_style_values)
      AND scm.capability_value = ANY(p_capability_values)
    ORDER BY scm.capability_value, scm.token_multiplier DESC
  LOOP
    v_cap_tokens := ROUND(v_map.base_token_cost * v_map.token_multiplier);
    v_base_tokens := v_base_tokens + v_cap_tokens;

    v_breakdown := v_breakdown || jsonb_build_object(
      'capability', v_map.capability_value,
      'capabilityLabel', v_map.cap_label,
      'tokens', v_cap_tokens,
      'multiplier', v_map.token_multiplier,
      'isRequired', v_map.is_required
    );
  END LOOP;

  v_platform_multiplier := GREATEST(1, p_platform_count * 0.8);
  v_region_multiplier := GREATEST(1, p_region_count * 0.6);
  v_total := ROUND(v_base_tokens * v_platform_multiplier * v_region_multiplier);

  IF v_total <= 300 THEN v_tier := 'light';
  ELSIF v_total <= 600 THEN v_tier := 'moderate';
  ELSIF v_total <= 1000 THEN v_tier := 'heavy';
  ELSE v_tier := 'premium';
  END IF;

  RETURN jsonb_build_object(
    'totalTokens', v_total,
    'tier', v_tier,
    'breakdown', v_breakdown,
    'platformMultiplier', v_platform_multiplier,
    'regionMultiplier', v_region_multiplier,
    'estimatedMinutes', GREATEST(1, ROUND(v_total / 100.0))
  );
END;
$$;

-- 6B. Create a cast project atomically
CREATE OR REPLACE FUNCTION public.create_cast_project(
  p_title TEXT,
  p_user_id UUID,
  p_blueprint_id UUID DEFAULT NULL,
  p_style_intent TEXT DEFAULT 'corporate',
  p_intent_value TEXT DEFAULT NULL,
  p_product_context TEXT DEFAULT NULL,
  p_team_id UUID DEFAULT NULL,
  p_target_regions TEXT[] DEFAULT ARRAY['global'],
  p_selected_dialects TEXT[] DEFAULT ARRAY['en-US']
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_project_id UUID;
BEGIN
  INSERT INTO cast_projects (
    user_id, team_id, title, blueprint_id, style_intent,
    intent_value, product_context, target_regions, selected_dialects,
    status, current_stage
  ) VALUES (
    p_user_id, p_team_id, p_title, p_blueprint_id, p_style_intent,
    p_intent_value, p_product_context, p_target_regions, p_selected_dialects,
    'draft', 'template_selection'
  )
  RETURNING id INTO v_project_id;

  RETURN v_project_id;
END;
$$;

-- 6C. Advance cast project stage
CREATE OR REPLACE FUNCTION public.advance_cast_project_stage(
  p_project_id UUID,
  p_new_stage TEXT,
  p_new_status public.cast_project_status DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE cast_projects
  SET
    completed_stages = array_append(
      array_remove(completed_stages, current_stage),
      current_stage
    ),
    current_stage = p_new_stage,
    status = COALESCE(p_new_status, status),
    updated_at = now()
  WHERE id = p_project_id
    AND user_id = auth.uid();
END;
$$;

-- 6D. Get generation job statistics for a project
CREATE OR REPLACE FUNCTION public.get_cast_project_job_stats(p_project_id UUID)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'total', COUNT(*),
    'queued', COUNT(*) FILTER (WHERE status = 'queued'),
    'processing', COUNT(*) FILTER (WHERE status = 'processing'),
    'rendering', COUNT(*) FILTER (WHERE status = 'rendering'),
    'completed', COUNT(*) FILTER (WHERE status = 'completed'),
    'failed', COUNT(*) FILTER (WHERE status = 'failed'),
    'cancelled', COUNT(*) FILTER (WHERE status = 'cancelled'),
    'totalTokens', COALESCE(SUM(actual_tokens_used), 0),
    'totalCostUsd', COALESCE(SUM(estimated_cost_usd), 0),
    'avgDurationSeconds', COALESCE(AVG(EXTRACT(EPOCH FROM (completed_at - started_at))), 0)
  )
  FROM cast_generation_jobs
  WHERE project_id = p_project_id;
$$;

-- 6E. Link a show to a cast project with ownership verification
CREATE OR REPLACE FUNCTION public.link_show_to_cast(
  p_show_id UUID,
  p_cast_project_id UUID,
  p_link_type TEXT DEFAULT 'publish',
  p_publish_platforms TEXT[] DEFAULT '{}',
  p_scheduled_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_link_id UUID;
BEGIN
  -- Verify show ownership
  IF NOT EXISTS (SELECT 1 FROM shows WHERE id = p_show_id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Show not found or not owned by user';
  END IF;

  -- Verify cast project ownership
  IF NOT EXISTS (SELECT 1 FROM cast_projects WHERE id = p_cast_project_id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Cast project not found or not owned by user';
  END IF;

  INSERT INTO show_cast_links (
    show_id, cast_project_id, link_type,
    publish_platforms, scheduled_publish_at, created_by
  ) VALUES (
    p_show_id, p_cast_project_id, p_link_type,
    p_publish_platforms, p_scheduled_at, auth.uid()
  )
  ON CONFLICT (show_id, cast_project_id, link_type)
  DO UPDATE SET
    publish_platforms = EXCLUDED.publish_platforms,
    scheduled_publish_at = EXCLUDED.scheduled_publish_at,
    is_active = true,
    updated_at = now()
  RETURNING id INTO v_link_id;

  RETURN v_link_id;
END;
$$;
