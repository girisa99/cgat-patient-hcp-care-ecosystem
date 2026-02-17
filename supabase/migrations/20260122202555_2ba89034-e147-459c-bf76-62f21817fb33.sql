-- CRITICAL FIX: Editor Drafts Persistence Table
-- Migrates from localStorage to Supabase for data durability

CREATE TABLE public.editor_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id TEXT NOT NULL,
  project_data JSONB NOT NULL,
  checkpoints JSONB DEFAULT '[]'::jsonb,
  partial_results JSONB DEFAULT '{}'::jsonb,
  version INTEGER NOT NULL DEFAULT 1,
  last_saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_project UNIQUE (user_id, project_id)
);

-- Enable RLS
ALTER TABLE public.editor_drafts ENABLE ROW LEVEL SECURITY;

-- User can only access their own drafts
CREATE POLICY "Users can view their own drafts"
  ON public.editor_drafts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own drafts"
  ON public.editor_drafts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own drafts"
  ON public.editor_drafts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own drafts"
  ON public.editor_drafts FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_editor_drafts_user_id ON public.editor_drafts(user_id);
CREATE INDEX idx_editor_drafts_project_id ON public.editor_drafts(project_id);
CREATE INDEX idx_editor_drafts_updated_at ON public.editor_drafts(updated_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_editor_drafts_updated_at
  BEFORE UPDATE ON public.editor_drafts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Offline sync queue table
CREATE TABLE public.offline_sync_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('create', 'update', 'delete')),
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  payload JSONB NOT NULL,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 5,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.offline_sync_queue ENABLE ROW LEVEL SECURITY;

-- User policies
CREATE POLICY "Users can manage their own sync queue"
  ON public.offline_sync_queue FOR ALL
  USING (auth.uid() = user_id);

-- Index for processing
CREATE INDEX idx_offline_sync_pending ON public.offline_sync_queue(status, created_at) WHERE status = 'pending';