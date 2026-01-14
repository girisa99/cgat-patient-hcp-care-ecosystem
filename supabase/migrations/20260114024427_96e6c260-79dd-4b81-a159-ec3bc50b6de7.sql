-- Add source tracking field to genie_scripts table
ALTER TABLE public.genie_scripts 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual' 
  CHECK (source IN ('spark', 'mind', 'manual', 'upload', 'import'));

-- Add index for filtering by source
CREATE INDEX IF NOT EXISTS idx_genie_scripts_source ON public.genie_scripts(source);

-- Add comment for documentation
COMMENT ON COLUMN public.genie_scripts.source IS 'Origin of script: spark (Genie Spark), mind (Genie Mind), manual (written), upload (file upload), import (external import)';