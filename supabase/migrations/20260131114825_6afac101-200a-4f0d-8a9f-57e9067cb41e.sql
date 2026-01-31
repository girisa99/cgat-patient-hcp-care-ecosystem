-- Create composition_projects table to persist Create→Review workflow data
CREATE TABLE public.composition_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  primary_language TEXT NOT NULL DEFAULT 'en',
  additional_languages TEXT[] DEFAULT ARRAY[]::TEXT[],
  template_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  output_mode TEXT DEFAULT 'combined',
  total_duration INTEGER DEFAULT 0,
  overall_confidence_score NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create composition_chapters table for chapter-level data with confidence scores
CREATE TABLE public.composition_chapters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.composition_projects(id) ON DELETE CASCADE,
  chapter_order INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  duration INTEGER DEFAULT 30,
  visual_types TEXT[] DEFAULT ARRAY['video']::TEXT[],
  
  -- Script data
  script_content TEXT,
  script_source TEXT DEFAULT 'auto',
  ai_suggested_prompt TEXT,
  custom_prompt TEXT,
  script_confidence_score NUMERIC,
  script_confidence_factors JSONB,
  
  -- Voice/Audio data (multi-language support)
  voice_source TEXT DEFAULT 'tts',
  audio_by_language JSONB DEFAULT '{}'::JSONB,
  audio_confidence_score NUMERIC,
  audio_confidence_factors JSONB,
  
  -- Video/Visual data  
  video_url TEXT,
  preview_url TEXT,
  video_provider TEXT,
  video_confidence_score NUMERIC,
  video_confidence_factors JSONB,
  
  -- Music data
  music_source TEXT DEFAULT 'none',
  music_url TEXT,
  music_provider TEXT,
  
  -- Approval workflow
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  feedback TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.composition_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.composition_chapters ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for composition_projects
CREATE POLICY "Users can view their own projects" 
ON public.composition_projects 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects" 
ON public.composition_projects 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" 
ON public.composition_projects 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" 
ON public.composition_projects 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for composition_chapters (based on project ownership)
CREATE POLICY "Users can view chapters of their projects" 
ON public.composition_chapters 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.composition_projects 
  WHERE id = composition_chapters.project_id AND user_id = auth.uid()
));

CREATE POLICY "Users can create chapters in their projects" 
ON public.composition_chapters 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.composition_projects 
  WHERE id = composition_chapters.project_id AND user_id = auth.uid()
));

CREATE POLICY "Users can update chapters in their projects" 
ON public.composition_chapters 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.composition_projects 
  WHERE id = composition_chapters.project_id AND user_id = auth.uid()
));

CREATE POLICY "Users can delete chapters from their projects" 
ON public.composition_chapters 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.composition_projects 
  WHERE id = composition_chapters.project_id AND user_id = auth.uid()
));

-- Create indexes for performance
CREATE INDEX idx_composition_projects_user ON public.composition_projects(user_id);
CREATE INDEX idx_composition_chapters_project ON public.composition_chapters(project_id);
CREATE INDEX idx_composition_chapters_order ON public.composition_chapters(project_id, chapter_order);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_composition_projects_updated_at
BEFORE UPDATE ON public.composition_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_composition_chapters_updated_at
BEFORE UPDATE ON public.composition_chapters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();