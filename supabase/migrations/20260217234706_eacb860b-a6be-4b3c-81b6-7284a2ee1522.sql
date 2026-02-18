
-- Training data captures table for Label Studio pipeline
CREATE TABLE public.training_data_captures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  training_type TEXT NOT NULL CHECK (training_type IN ('segmentation', 'avatar', 'voice', 'video', 'text_classification', 'ner')),
  data_url TEXT, -- storage URL or base64 reference
  metadata JSONB DEFAULT '{}'::jsonb,
  label_studio_project_id INTEGER,
  label_studio_task_id INTEGER,
  sync_status TEXT NOT NULL DEFAULT 'pending' CHECK (sync_status IN ('pending', 'uploading', 'synced', 'failed', 'annotated')),
  quality_score NUMERIC(3,2),
  annotation_result JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.training_data_captures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own training data"
  ON public.training_data_captures FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own training data"
  ON public.training_data_captures FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own training data"
  ON public.training_data_captures FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own training data"
  ON public.training_data_captures FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_training_data_captures_updated_at
  BEFORE UPDATE ON public.training_data_captures
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for efficient queries
CREATE INDEX idx_training_data_sync_status ON public.training_data_captures(sync_status);
CREATE INDEX idx_training_data_type ON public.training_data_captures(training_type);
CREATE INDEX idx_training_data_user ON public.training_data_captures(user_id);
