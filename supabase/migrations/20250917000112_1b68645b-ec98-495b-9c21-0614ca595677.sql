-- Create enrollment submissions table for PDF tracking
CREATE TABLE public.enrollment_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id TEXT NOT NULL,
  form_type TEXT NOT NULL CHECK (form_type IN ('8-tab-clinical', '6-tab-enhanced')),
  pdf_url TEXT,
  docusign_envelope_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'signed')),
  submission_data JSONB NOT NULL DEFAULT '{}',
  signatures JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users
);

-- Enable RLS
ALTER TABLE public.enrollment_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own enrollment submissions"
ON public.enrollment_submissions
FOR SELECT
USING (auth.uid() = created_by);

CREATE POLICY "Users can create enrollment submissions"
ON public.enrollment_submissions
FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own enrollment submissions"
ON public.enrollment_submissions
FOR UPDATE
USING (auth.uid() = created_by);

-- Create storage bucket for enrollment documents
INSERT INTO storage.buckets (id, name, public) VALUES ('enrollment-documents', 'enrollment-documents', true);

-- Create storage policies
CREATE POLICY "Users can upload enrollment documents"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'enrollment-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view enrollment documents"
ON storage.objects
FOR SELECT
USING (bucket_id = 'enrollment-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create trigger for updated_at
CREATE TRIGGER update_enrollment_submissions_updated_at
BEFORE UPDATE ON public.enrollment_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create agent analytics table
CREATE TABLE public.agent_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  channel_type TEXT NOT NULL,
  environment TEXT NOT NULL DEFAULT 'production',
  performance_metrics JSONB DEFAULT '{}',
  usage_stats JSONB DEFAULT '{}',
  health_metrics JSONB DEFAULT '{}',
  measured_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for agent analytics
ALTER TABLE public.agent_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view analytics for their agents"
ON public.agent_analytics
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.agents
  WHERE agents.id = agent_analytics.agent_id
  AND agents.created_by = auth.uid()
));

CREATE POLICY "System can insert agent analytics"
ON public.agent_analytics
FOR INSERT
WITH CHECK (true);

-- Create workflow execution logs table
CREATE TABLE public.workflow_execution_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  workflow_type TEXT NOT NULL,
  execution_data JSONB DEFAULT '{}',
  result_data JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed')),
  duration_ms INTEGER,
  error_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for workflow logs
ALTER TABLE public.workflow_execution_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view workflow logs for their agents"
ON public.workflow_execution_logs
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.agents
  WHERE agents.id = workflow_execution_logs.agent_id
  AND agents.created_by = auth.uid()
));

CREATE POLICY "System can manage workflow logs"
ON public.workflow_execution_logs
FOR ALL
USING (true)
WITH CHECK (true);