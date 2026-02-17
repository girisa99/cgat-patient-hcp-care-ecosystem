-- Script versions table to track version history
CREATE TABLE public.script_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  script_id UUID NOT NULL REFERENCES public.genie_scripts(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  
  -- Content versions
  original_content TEXT NOT NULL,
  enhanced_content TEXT,
  clean_content TEXT,
  
  -- Version metadata
  version_type TEXT NOT NULL DEFAULT 'original' CHECK (version_type IN ('original', 'enhanced', 'manual_edit')),
  change_summary TEXT,
  
  -- Analysis/enhancement metadata
  analysis_results JSONB,
  enhancement_changes JSONB,
  
  -- Tracking
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure unique version numbers per script
  UNIQUE(script_id, version_number)
);

-- Index for fast lookups
CREATE INDEX idx_script_versions_script_id ON public.script_versions(script_id);
CREATE INDEX idx_script_versions_created_at ON public.script_versions(created_at DESC);

-- Enable RLS
ALTER TABLE public.script_versions ENABLE ROW LEVEL SECURITY;

-- Users can view versions of scripts they own
CREATE POLICY "Users can view their script versions" 
ON public.script_versions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.genie_scripts gs 
    WHERE gs.id = script_versions.script_id 
    AND gs.user_id = auth.uid()
  )
);

-- Users can create versions for scripts they own
CREATE POLICY "Users can create script versions" 
ON public.script_versions 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.genie_scripts gs 
    WHERE gs.id = script_versions.script_id 
    AND gs.user_id = auth.uid()
  )
);

-- Users can delete versions of scripts they own
CREATE POLICY "Users can delete their script versions" 
ON public.script_versions 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.genie_scripts gs 
    WHERE gs.id = script_versions.script_id 
    AND gs.user_id = auth.uid()
  )
);

-- Add current_version_id to genie_scripts to track active version
ALTER TABLE public.genie_scripts 
ADD COLUMN IF NOT EXISTS current_version_id UUID REFERENCES public.script_versions(id);

-- Add version tracking to show_assets for recordings
ALTER TABLE public.show_assets
ADD COLUMN IF NOT EXISTS script_version_id UUID REFERENCES public.script_versions(id);

-- Function to get the next version number for a script
CREATE OR REPLACE FUNCTION public.get_next_script_version_number(p_script_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_version INTEGER;
BEGIN
  SELECT COALESCE(MAX(version_number), 0) + 1 
  INTO next_version
  FROM public.script_versions
  WHERE script_id = p_script_id;
  
  RETURN next_version;
END;
$$;

-- Trigger to auto-create initial version when script is created
CREATE OR REPLACE FUNCTION public.create_initial_script_version()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_version_id UUID;
BEGIN
  -- Create initial version
  INSERT INTO public.script_versions (
    script_id, 
    version_number, 
    original_content, 
    version_type,
    created_by
  )
  VALUES (
    NEW.id, 
    1, 
    NEW.content, 
    'original',
    NEW.user_id
  )
  RETURNING id INTO new_version_id;
  
  -- Update script with current version
  UPDATE public.genie_scripts 
  SET current_version_id = new_version_id
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new scripts
DROP TRIGGER IF EXISTS on_script_created_create_version ON public.genie_scripts;
CREATE TRIGGER on_script_created_create_version
  AFTER INSERT ON public.genie_scripts
  FOR EACH ROW
  EXECUTE FUNCTION public.create_initial_script_version();