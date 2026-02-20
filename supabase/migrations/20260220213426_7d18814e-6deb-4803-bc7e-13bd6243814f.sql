
-- ═══════════════════════════════════════════════════════════════════
-- Cast Project Scenes: Full production state per scene
-- Enables complete project restoration from the dropdown
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE public.cast_project_scenes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.cast_projects(id) ON DELETE CASCADE,
  scene_key TEXT NOT NULL,
  scene_index INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  art_style TEXT,
  visual_style TEXT,
  background_url TEXT,
  thumbnail_url TEXT,
  duration_seconds NUMERIC DEFAULT 0,
  is_optional BOOLEAN DEFAULT false,
  scene_config JSONB NOT NULL DEFAULT '{}',  -- visual_config, transition, motion settings
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, scene_key)
);

-- Scene script lines: individual dialogue/narration lines within a scene
CREATE TABLE public.cast_project_script_lines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.cast_projects(id) ON DELETE CASCADE,
  scene_id UUID NOT NULL REFERENCES public.cast_project_scenes(id) ON DELETE CASCADE,
  line_key TEXT NOT NULL,
  line_index INTEGER NOT NULL DEFAULT 0,
  character_id TEXT NOT NULL,           -- host, atlas, nova, squirrel, allaudin
  dialogue TEXT NOT NULL,               -- the actual spoken text
  direction TEXT,                       -- acting direction/mood
  motion TEXT,                          -- animation/motion cues
  sfx_tags TEXT[] DEFAULT '{}',         -- sound effect tags
  visual_tags TEXT[] DEFAULT '{}',      -- visual overlay tags  
  duration_hint TEXT,                   -- e.g. "~30s"
  tts_audio_url TEXT,                   -- generated TTS audio URL
  tts_provider TEXT,                    -- elevenlabs, azure, etc.
  tts_voice_id TEXT,                    -- voice ID used
  tts_status TEXT DEFAULT 'pending',    -- pending, generating, done, error
  tts_generated_at TIMESTAMPTZ,
  line_config JSONB NOT NULL DEFAULT '{}', -- any extra metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, line_key)
);

-- Character definitions per project (voice routing, avatars)
CREATE TABLE public.cast_project_characters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.cast_projects(id) ON DELETE CASCADE,
  character_key TEXT NOT NULL,          -- host, atlas, nova, etc.
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  voice_provider TEXT,                  -- elevenlabs, azure
  voice_id TEXT,                        -- provider-specific voice ID
  voice_config JSONB DEFAULT '{}',      -- stability, pitch, rate, etc.
  color_class TEXT,                     -- CSS class for UI
  role_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, character_key)
);

-- Indexes for fast project restoration
CREATE INDEX idx_cast_scenes_project ON public.cast_project_scenes(project_id, scene_index);
CREATE INDEX idx_cast_lines_scene ON public.cast_project_script_lines(scene_id, line_index);
CREATE INDEX idx_cast_lines_project ON public.cast_project_script_lines(project_id);
CREATE INDEX idx_cast_characters_project ON public.cast_project_characters(project_id);

-- Enable RLS
ALTER TABLE public.cast_project_scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cast_project_script_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cast_project_characters ENABLE ROW LEVEL SECURITY;

-- RLS: Users can only access their own project data
CREATE POLICY "Users manage own project scenes"
  ON public.cast_project_scenes FOR ALL
  USING (project_id IN (SELECT id FROM public.cast_projects WHERE user_id = auth.uid()))
  WITH CHECK (project_id IN (SELECT id FROM public.cast_projects WHERE user_id = auth.uid()));

CREATE POLICY "Users manage own project script lines"
  ON public.cast_project_script_lines FOR ALL
  USING (project_id IN (SELECT id FROM public.cast_projects WHERE user_id = auth.uid()))
  WITH CHECK (project_id IN (SELECT id FROM public.cast_projects WHERE user_id = auth.uid()));

CREATE POLICY "Users manage own project characters"
  ON public.cast_project_characters FOR ALL
  USING (project_id IN (SELECT id FROM public.cast_projects WHERE user_id = auth.uid()))
  WITH CHECK (project_id IN (SELECT id FROM public.cast_projects WHERE user_id = auth.uid()));

-- Auto-update timestamps
CREATE TRIGGER update_cast_scenes_updated_at
  BEFORE UPDATE ON public.cast_project_scenes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cast_lines_updated_at
  BEFORE UPDATE ON public.cast_project_script_lines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
