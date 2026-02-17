-- Add RLS policies for low priority tables: document_processing_queue and external_api_change_logs

-- ==============================================
-- RLS policies for document_processing_queue
-- ==============================================

-- Users can view document processing jobs for knowledge bases they own
CREATE POLICY "Users can view their own document processing jobs" 
ON public.document_processing_queue 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.knowledge_base kb 
    WHERE kb.id = document_processing_queue.knowledge_base_id 
    AND kb.created_by = auth.uid()
  )
);

-- Users can insert document processing jobs for knowledge bases they own
CREATE POLICY "Users can create document processing jobs for their knowledge bases" 
ON public.document_processing_queue 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.knowledge_base kb 
    WHERE kb.id = document_processing_queue.knowledge_base_id 
    AND kb.created_by = auth.uid()
  )
);

-- Users can update document processing jobs for knowledge bases they own
CREATE POLICY "Users can update their own document processing jobs" 
ON public.document_processing_queue 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.knowledge_base kb 
    WHERE kb.id = document_processing_queue.knowledge_base_id 
    AND kb.created_by = auth.uid()
  )
);

-- System can manage all document processing jobs (for background processing)
CREATE POLICY "System can manage all document processing jobs" 
ON public.document_processing_queue 
FOR ALL 
TO service_role
USING (true);

-- Admins can manage all document processing jobs
CREATE POLICY "Admins can manage all document processing jobs" 
ON public.document_processing_queue 
FOR ALL 
TO authenticated
USING (is_admin_user_safe(auth.uid()))
WITH CHECK (is_admin_user_safe(auth.uid()));

-- ==============================================
-- RLS policies for external_api_change_logs
-- ==============================================

-- Users can view change logs for external APIs they created
CREATE POLICY "Users can view change logs for their APIs" 
ON public.external_api_change_logs 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.external_api_registry ear 
    WHERE ear.id = external_api_change_logs.external_api_id 
    AND ear.created_by = auth.uid()
  )
);

-- Users can create change logs for external APIs they own
CREATE POLICY "Users can create change logs for their APIs" 
ON public.external_api_change_logs 
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = created_by
  AND EXISTS (
    SELECT 1 FROM public.external_api_registry ear 
    WHERE ear.id = external_api_change_logs.external_api_id 
    AND ear.created_by = auth.uid()
  )
);

-- Users can update change logs they created for their APIs
CREATE POLICY "Users can update their own change logs" 
ON public.external_api_change_logs 
FOR UPDATE 
TO authenticated
USING (
  auth.uid() = created_by
  AND EXISTS (
    SELECT 1 FROM public.external_api_registry ear 
    WHERE ear.id = external_api_change_logs.external_api_id 
    AND ear.created_by = auth.uid()
  )
);

-- Users can delete change logs they created for their APIs
CREATE POLICY "Users can delete their own change logs" 
ON public.external_api_change_logs 
FOR DELETE 
TO authenticated
USING (
  auth.uid() = created_by
  AND EXISTS (
    SELECT 1 FROM public.external_api_registry ear 
    WHERE ear.id = external_api_change_logs.external_api_id 
    AND ear.created_by = auth.uid()
  )
);

-- Admins can manage all change logs
CREATE POLICY "Admins can manage all change logs" 
ON public.external_api_change_logs 
FOR ALL 
TO authenticated
USING (is_admin_user_safe(auth.uid()))
WITH CHECK (is_admin_user_safe(auth.uid()));

-- System can manage all change logs (for automated processes)
CREATE POLICY "System can manage all change logs" 
ON public.external_api_change_logs 
FOR ALL 
TO service_role
USING (true);