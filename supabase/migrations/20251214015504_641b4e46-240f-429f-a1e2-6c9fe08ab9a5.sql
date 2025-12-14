-- Add DELETE policy for document processing jobs
CREATE POLICY "Users can delete their own document jobs"
  ON public.document_processing_jobs
  FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);