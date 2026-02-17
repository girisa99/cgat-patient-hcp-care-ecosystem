
-- Script improvement suggestions / feedback table
CREATE TABLE public.script_improvement_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  script_id UUID NOT NULL REFERENCES public.regional_narration_scripts(id) ON DELETE CASCADE,
  note_type TEXT NOT NULL CHECK (note_type IN ('reviewer_comment', 'ab_learning', 'ai_suggestion', 'performance_insight')),
  content TEXT NOT NULL,
  section_target TEXT CHECK (section_target IN ('hook', 'problem_statement', 'solution', 'cta', 'full_script', 'general')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'accepted', 'rejected', 'applied')),
  ai_model_used TEXT,
  framework_tag TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID,
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.script_improvement_notes ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access (internal tool)
CREATE POLICY "Authenticated users can manage script notes"
  ON public.script_improvement_notes
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Index for fast lookups by script
CREATE INDEX idx_script_notes_script_id ON public.script_improvement_notes(script_id);
CREATE INDEX idx_script_notes_status ON public.script_improvement_notes(status);
