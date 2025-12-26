-- Create document AI analytics table for tracking model usage
CREATE TABLE public.document_ai_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id TEXT, -- Reference to document (no FK since table may not exist)
  user_id UUID,
  
  -- Model routing info
  document_type_id TEXT NOT NULL,
  document_category TEXT NOT NULL,
  file_name TEXT,
  
  -- Model selection
  primary_model TEXT NOT NULL, -- claude, gemini, openai
  selection_reason TEXT NOT NULL, -- explicit_config, category_default, content_analysis
  selection_confidence NUMERIC(3,2) DEFAULT 0.0,
  
  -- Execution details
  model_used TEXT NOT NULL, -- actual model that succeeded
  fallbacks_attempted TEXT[] DEFAULT '{}',
  pipeline_type TEXT DEFAULT 'single', -- single, sequential-hybrid
  stage1_model TEXT, -- for hybrid pipelines
  stage2_model TEXT, -- for hybrid pipelines
  
  -- Performance metrics
  processing_time_ms INTEGER NOT NULL DEFAULT 0,
  tokens_used INTEGER,
  estimated_cost NUMERIC(10,6),
  
  -- Results
  success BOOLEAN NOT NULL DEFAULT true,
  confidence_score NUMERIC(3,2),
  error_message TEXT,
  warnings TEXT[],
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.document_ai_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies - allow insert without auth for edge function logging
CREATE POLICY "Allow insert for document analytics"
  ON public.document_ai_analytics
  FOR INSERT
  WITH CHECK (true);

-- Users can view their own analytics
CREATE POLICY "Users can view their own analytics"
  ON public.document_ai_analytics
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Create indexes for common queries
CREATE INDEX idx_doc_ai_analytics_user ON public.document_ai_analytics(user_id);
CREATE INDEX idx_doc_ai_analytics_model ON public.document_ai_analytics(model_used);
CREATE INDEX idx_doc_ai_analytics_created ON public.document_ai_analytics(created_at DESC);
CREATE INDEX idx_doc_ai_analytics_doc_type ON public.document_ai_analytics(document_type_id);

-- Add comment
COMMENT ON TABLE public.document_ai_analytics IS 'Tracks AI model usage for document processing including routing decisions, performance, and costs';