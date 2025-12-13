-- Add missing columns to document_processing_jobs table
ALTER TABLE public.document_processing_jobs 
ADD COLUMN IF NOT EXISTS document_type text DEFAULT 'unknown',
ADD COLUMN IF NOT EXISTS validation_status text DEFAULT 'pending';