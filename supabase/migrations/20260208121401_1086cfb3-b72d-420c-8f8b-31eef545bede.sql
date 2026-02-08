-- Blueprint Customization Drafts
-- Persists user scene modifications separately from system blueprints
-- Follows the Database-First pattern used by composition_projects and editor_drafts

CREATE TABLE public.blueprint_customization_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blueprint_id UUID NOT NULL REFERENCES public.video_blueprints(id) ON DELETE CASCADE,
  
  -- Customized scene data (full scene array with modifications)
  customized_scenes JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Granular override tracking
  script_overrides JSONB NOT NULL DEFAULT '{}'::jsonb,
  visual_config_overrides JSONB NOT NULL DEFAULT '{}'::jsonb,
  duration_overrides JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Draft lifecycle
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'committed', 'archived')),
  draft_name TEXT,
  
  -- Change tracking
  change_log JSONB NOT NULL DEFAULT '[]'::jsonb,
  version INTEGER NOT NULL DEFAULT 1,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  committed_at TIMESTAMPTZ,
  
  -- One active draft per user per blueprint
  UNIQUE (user_id, blueprint_id, status)
);

-- Enable RLS
ALTER TABLE public.blueprint_customization_drafts ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own drafts
CREATE POLICY "Users can view their own drafts"
  ON public.blueprint_customization_drafts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own drafts"
  ON public.blueprint_customization_drafts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own drafts"
  ON public.blueprint_customization_drafts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own drafts"
  ON public.blueprint_customization_drafts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX idx_blueprint_drafts_user_blueprint 
  ON public.blueprint_customization_drafts(user_id, blueprint_id);

CREATE INDEX idx_blueprint_drafts_status 
  ON public.blueprint_customization_drafts(status);

-- Auto-update timestamp trigger
CREATE TRIGGER update_blueprint_drafts_updated_at
  BEFORE UPDATE ON public.blueprint_customization_drafts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();