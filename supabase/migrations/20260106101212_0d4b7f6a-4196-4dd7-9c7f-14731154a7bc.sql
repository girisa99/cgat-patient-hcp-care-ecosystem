-- Add agent_findings column to store execution results
ALTER TABLE document_processing_jobs
ADD COLUMN IF NOT EXISTS agent_findings jsonb DEFAULT '[]'::jsonb;

-- Add agent_execution_status column
ALTER TABLE document_processing_jobs
ADD COLUMN IF NOT EXISTS agent_execution_status text DEFAULT 'none';

-- Add image storage columns for proper thumbnail handling
ALTER TABLE document_processing_jobs
ADD COLUMN IF NOT EXISTS image_url text;

ALTER TABLE document_processing_jobs
ADD COLUMN IF NOT EXISTS thumbnail_url text;

ALTER TABLE document_processing_jobs
ADD COLUMN IF NOT EXISTS image_storage_path text;

-- Create index for querying by agent execution status
CREATE INDEX IF NOT EXISTS idx_document_processing_agent_status 
ON document_processing_jobs(agent_execution_status) 
WHERE agent_execution_status IS NOT NULL AND agent_execution_status != 'none';

-- Add RLS policies for document-processing storage bucket
-- Allow authenticated users to upload to their own folder
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'document-processing', 
  'document-processing', 
  true,
  52428800,
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/tiff', 'image/heic', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload their own document files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own document files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own document files" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for document thumbnails" ON storage.objects;

-- Allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload their own document files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'document-processing' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to view their own files
CREATE POLICY "Users can view their own document files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'document-processing'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete their own document files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'document-processing'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access for document thumbnails (for history display)
CREATE POLICY "Public read access for document thumbnails"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'document-processing'
  AND name LIKE '%/thumbnail_%'
);