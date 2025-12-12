-- Create document_processing_jobs table for real-time document processing
CREATE TABLE IF NOT EXISTS public.document_processing_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  mime_type TEXT,
  status TEXT NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'completed', 'error', 'cancelled')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  current_stage TEXT,
  stage_message TEXT,
  extracted_text TEXT,
  extracted_metadata JSONB,
  processing_config JSONB,
  stages JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  user_id UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.document_processing_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own document jobs"
  ON public.document_processing_jobs
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create document jobs"
  ON public.document_processing_jobs
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own document jobs"
  ON public.document_processing_jobs
  FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Enable realtime for the table
ALTER TABLE public.document_processing_jobs REPLICA IDENTITY FULL;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.document_processing_jobs;

-- Create storage bucket for document processing (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('document-processing', 'document-processing', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for document-processing bucket
CREATE POLICY "Authenticated users can upload documents"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'document-processing' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view documents"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'document-processing');

CREATE POLICY "Service role can manage documents"
  ON storage.objects
  FOR ALL
  USING (bucket_id = 'document-processing' AND auth.role() = 'service_role');

-- Create index for faster queries
CREATE INDEX idx_document_processing_jobs_status ON public.document_processing_jobs(status);
CREATE INDEX idx_document_processing_jobs_user ON public.document_processing_jobs(user_id);
CREATE INDEX idx_document_processing_jobs_created ON public.document_processing_jobs(created_at DESC);