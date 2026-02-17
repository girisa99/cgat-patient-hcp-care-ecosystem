-- Add export tracking columns to document_processing_jobs
ALTER TABLE public.document_processing_jobs 
ADD COLUMN IF NOT EXISTS export_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS exported_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS export_targets text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS export_format text;

-- Add index for filtering
CREATE INDEX IF NOT EXISTS idx_document_processing_jobs_export_status 
ON public.document_processing_jobs(export_status);

CREATE INDEX IF NOT EXISTS idx_document_processing_jobs_document_type 
ON public.document_processing_jobs(document_type);

CREATE INDEX IF NOT EXISTS idx_document_processing_jobs_created_at 
ON public.document_processing_jobs(created_at DESC);

-- Add comment for clarity
COMMENT ON COLUMN public.document_processing_jobs.export_status IS 'pending, exported, partial';
COMMENT ON COLUMN public.document_processing_jobs.export_targets IS 'Array of targets exported to: supabase, salesforce, hubspot, etc.';
COMMENT ON COLUMN public.document_processing_jobs.export_format IS 'json or csv';