-- Create presentation_versions table for multi-language support with file naming
CREATE TABLE IF NOT EXISTS public.presentation_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  presentation_id UUID NOT NULL REFERENCES public.presentations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Language identifier
  language_code VARCHAR(10) NOT NULL, -- e.g., 'en', 'es', 'fr'
  is_primary BOOLEAN DEFAULT false,
  
  -- Version data
  slides_data JSONB DEFAULT '[]'::jsonb,
  thumbnails JSONB DEFAULT '[]'::jsonb, -- Array of thumbnail URLs per slide
  
  -- AI Model configuration per language
  model_config JSONB DEFAULT '{}'::jsonb, -- { textModel, imageModel, voiceModel }
  
  -- Generation status
  status VARCHAR(50) DEFAULT 'pending', -- pending, generating, complete, error
  generation_progress INTEGER DEFAULT 0, -- 0-100
  current_slide INTEGER DEFAULT 0,
  total_slides INTEGER DEFAULT 0,
  
  -- Content type decisions by AI
  content_decisions JSONB DEFAULT '[]'::jsonb, -- Array of { slideNumber, contentType, confidence, reasoning }
  
  -- Confidence scores
  confidence_scores JSONB DEFAULT '{}'::jsonb, -- { overall, slides: [{ slideNumber, score, issues }] }
  
  -- File naming with language suffix
  file_name VARCHAR(255), -- e.g., "presentation_name_en.pptx"
  download_url TEXT,
  thumbnail_url TEXT,
  
  -- Voiceover data
  voiceover_data JSONB DEFAULT '{}'::jsonb, -- { provider, voice, audioUrls: [] }
  
  -- Error tracking
  error_message TEXT,
  error_details JSONB,
  
  -- Timestamps
  generation_started_at TIMESTAMPTZ,
  generation_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Unique constraint per presentation per language
  CONSTRAINT unique_presentation_language UNIQUE(presentation_id, language_code)
);

-- Create agent_generation_tasks for tracking parallel agent execution
CREATE TABLE IF NOT EXISTS public.agent_generation_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  version_id UUID NOT NULL REFERENCES public.presentation_versions(id) ON DELETE CASCADE,
  
  -- Agent identification
  agent_type VARCHAR(50) NOT NULL, -- 'slide_generator', 'image_generator', 'translator', 'voiceover'
  agent_name VARCHAR(100),
  
  -- Task details
  task_type VARCHAR(50) NOT NULL, -- 'content', 'image', 'translate', 'voiceover'
  slide_number INTEGER,
  language_code VARCHAR(10),
  
  -- Input/Output
  input_data JSONB DEFAULT '{}'::jsonb,
  output_data JSONB DEFAULT '{}'::jsonb,
  
  -- AI decisions
  content_type_decision VARCHAR(50), -- 'image', 'infographic', 'journey_map', 'table', 'chart', 'quote'
  decision_confidence DECIMAL(3,2), -- 0.00 - 1.00
  decision_reasoning TEXT,
  
  -- Model used
  model_provider VARCHAR(50),
  model_name VARCHAR(100),
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, running, complete, error
  progress INTEGER DEFAULT 0,
  
  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  
  -- Error handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_presentation_versions_presentation_id ON public.presentation_versions(presentation_id);
CREATE INDEX IF NOT EXISTS idx_presentation_versions_user_id ON public.presentation_versions(user_id);
CREATE INDEX IF NOT EXISTS idx_presentation_versions_language ON public.presentation_versions(language_code);
CREATE INDEX IF NOT EXISTS idx_presentation_versions_status ON public.presentation_versions(status);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_version_id ON public.agent_generation_tasks(version_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_status ON public.agent_generation_tasks(status);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_agent_type ON public.agent_generation_tasks(agent_type);

-- Enable RLS
ALTER TABLE public.presentation_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_generation_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for presentation_versions
CREATE POLICY "Users can view their own presentation versions"
ON public.presentation_versions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own presentation versions"
ON public.presentation_versions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own presentation versions"
ON public.presentation_versions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own presentation versions"
ON public.presentation_versions FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for agent_generation_tasks (through version ownership)
CREATE POLICY "Users can view their agent tasks"
ON public.agent_generation_tasks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.presentation_versions pv
    WHERE pv.id = version_id AND pv.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create agent tasks for their versions"
ON public.agent_generation_tasks FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.presentation_versions pv
    WHERE pv.id = version_id AND pv.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their agent tasks"
ON public.agent_generation_tasks FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.presentation_versions pv
    WHERE pv.id = version_id AND pv.user_id = auth.uid()
  )
);

-- Trigger for updated_at
CREATE OR REPLACE TRIGGER update_presentation_versions_updated_at
BEFORE UPDATE ON public.presentation_versions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_agent_generation_tasks_updated_at
BEFORE UPDATE ON public.agent_generation_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();