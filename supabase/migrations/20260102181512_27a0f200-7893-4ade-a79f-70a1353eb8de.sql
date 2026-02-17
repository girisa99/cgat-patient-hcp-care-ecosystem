-- Create media_projects table for tracking all recording studio assets and costs
CREATE TABLE public.media_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  
  -- Cost tracking
  total_estimated_cost DECIMAL(10, 4) DEFAULT 0,
  tts_cost DECIMAL(10, 4) DEFAULT 0,
  music_generation_cost DECIMAL(10, 4) DEFAULT 0,
  transcription_cost DECIMAL(10, 4) DEFAULT 0,
  storage_cost DECIMAL(10, 4) DEFAULT 0,
  ai_enhancement_cost DECIMAL(10, 4) DEFAULT 0,
  
  -- Usage tracking
  total_recordings INTEGER DEFAULT 0,
  total_tts_generations INTEGER DEFAULT 0,
  total_music_generations INTEGER DEFAULT 0,
  total_transcriptions INTEGER DEFAULT 0,
  total_script_enhancements INTEGER DEFAULT 0,
  total_duration_seconds INTEGER DEFAULT 0,
  total_storage_bytes BIGINT DEFAULT 0,
  
  -- Metadata
  tags TEXT[],
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create media_project_assets table to link all assets to a project
CREATE TABLE public.media_project_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.media_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Asset reference (can be any type of media asset)
  asset_type TEXT NOT NULL CHECK (asset_type IN ('recording', 'script', 'voiceover', 'tts', 'music', 'transcription', 'enhancement')),
  asset_id TEXT NOT NULL, -- Can be UUID or IndexedDB ID
  asset_name TEXT NOT NULL,
  asset_url TEXT,
  
  -- Cost info for this specific asset
  cost DECIMAL(10, 4) DEFAULT 0,
  cost_details JSONB DEFAULT '{}',
  
  -- Asset metadata
  duration_seconds INTEGER,
  file_size_bytes BIGINT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create media_project_cost_logs for detailed cost tracking
CREATE TABLE public.media_project_cost_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.media_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Operation details
  operation_type TEXT NOT NULL CHECK (operation_type IN ('tts', 'music_gen', 'transcription', 'script_analysis', 'script_enhancement', 'storage', 'recording')),
  operation_name TEXT NOT NULL,
  
  -- Cost breakdown
  cost DECIMAL(10, 4) NOT NULL DEFAULT 0,
  cost_unit TEXT DEFAULT 'USD',
  
  -- Provider info
  provider TEXT, -- 'openai', 'elevenlabs', etc.
  model TEXT, -- specific model used
  
  -- Usage metrics
  input_tokens INTEGER,
  output_tokens INTEGER,
  duration_seconds INTEGER,
  characters_processed INTEGER,
  
  -- Metadata
  request_id TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.media_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_project_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_project_cost_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for media_projects
CREATE POLICY "Users can view their own media projects"
ON public.media_projects FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own media projects"
ON public.media_projects FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own media projects"
ON public.media_projects FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own media projects"
ON public.media_projects FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for media_project_assets
CREATE POLICY "Users can view their own project assets"
ON public.media_project_assets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own project assets"
ON public.media_project_assets FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own project assets"
ON public.media_project_assets FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for media_project_cost_logs
CREATE POLICY "Users can view their own cost logs"
ON public.media_project_cost_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cost logs"
ON public.media_project_cost_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_media_projects_user_id ON public.media_projects(user_id);
CREATE INDEX idx_media_projects_status ON public.media_projects(status);
CREATE INDEX idx_media_project_assets_project_id ON public.media_project_assets(project_id);
CREATE INDEX idx_media_project_assets_asset_type ON public.media_project_assets(asset_type);
CREATE INDEX idx_media_project_cost_logs_project_id ON public.media_project_cost_logs(project_id);
CREATE INDEX idx_media_project_cost_logs_operation_type ON public.media_project_cost_logs(operation_type);

-- Trigger to update updated_at
CREATE TRIGGER update_media_projects_updated_at
BEFORE UPDATE ON public.media_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();