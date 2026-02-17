-- Create table for storing extracted enrollment form data
-- Supports dynamic sections and fields from ANY enrollment form

CREATE TABLE IF NOT EXISTS public.enrollment_form_extractions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT,
  
  -- Form identification (manufacturer, program, etc.)
  form_identification JSONB DEFAULT '{}'::jsonb,
  
  -- Detected sections (dynamic - not hardcoded)
  detected_sections JSONB DEFAULT '[]'::jsonb,
  
  -- All extracted fields (flat array)
  all_fields JSONB DEFAULT '[]'::jsonb,
  
  -- Fields organized by section (object with section keys)
  fields_by_section JSONB DEFAULT '{}'::jsonb,
  
  -- Tables extracted (if any)
  extracted_tables JSONB DEFAULT '[]'::jsonb,
  
  -- Validation summary
  validation_summary JSONB DEFAULT '{}'::jsonb,
  
  -- Overall extraction confidence (0-1)
  overall_confidence DECIMAL(3,2),
  
  -- Pipeline info (models used, timing)
  pipeline_info JSONB DEFAULT '{}'::jsonb,
  
  -- Verification state (which sections/fields verified)
  verification_state JSONB DEFAULT '{}'::jsonb,
  
  -- Status tracking
  status TEXT DEFAULT 'extracted' CHECK (status IN ('extracted', 'verifying', 'verified', 'saved', 'submitted', 'error')),
  
  -- External system push tracking
  external_system_id TEXT,
  external_push_at TIMESTAMP WITH TIME ZONE,
  external_push_response JSONB,
  
  -- User tracking
  created_by UUID REFERENCES auth.users(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.enrollment_form_extractions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own extractions"
ON public.enrollment_form_extractions
FOR SELECT
USING (auth.uid() = created_by OR created_by IS NULL);

CREATE POLICY "Users can create extractions"
ON public.enrollment_form_extractions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own extractions"
ON public.enrollment_form_extractions
FOR UPDATE
USING (auth.uid() = created_by OR created_by IS NULL);

CREATE POLICY "Users can delete their own extractions"
ON public.enrollment_form_extractions
FOR DELETE
USING (auth.uid() = created_by OR created_by IS NULL);

-- Indexes for common queries
CREATE INDEX idx_enrollment_extractions_session ON public.enrollment_form_extractions(session_id);
CREATE INDEX idx_enrollment_extractions_status ON public.enrollment_form_extractions(status);
CREATE INDEX idx_enrollment_extractions_created_by ON public.enrollment_form_extractions(created_by);
CREATE INDEX idx_enrollment_extractions_created_at ON public.enrollment_form_extractions(created_at DESC);

-- GIN index for JSONB queries
CREATE INDEX idx_enrollment_extractions_form_id ON public.enrollment_form_extractions USING GIN (form_identification);

-- Trigger for updated_at
CREATE TRIGGER update_enrollment_form_extractions_updated_at
BEFORE UPDATE ON public.enrollment_form_extractions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();