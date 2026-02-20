-- Add content_type to cast_projects for flow routing
ALTER TABLE public.cast_projects 
ADD COLUMN IF NOT EXISTS content_type text NOT NULL DEFAULT 'video';

-- Add comment for clarity
COMMENT ON COLUMN public.cast_projects.content_type IS 'Content type: podcast, video, educational, ugc — determines workflow flow';
