-- Ralph Wiggum Findings Table for Dev-Only UI/UX Review System
-- Stores findings from Ralph Wiggum AI reviewer across all pages

CREATE TABLE public.ralph_wiggum_findings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Finding identification
  finding_hash TEXT NOT NULL, -- Unique hash based on content to prevent duplicates
  page_route TEXT NOT NULL, -- e.g., '/genie-studio', '/genie-vibe'
  module_name TEXT NOT NULL, -- e.g., 'vibe', 'spark', 'mind', 'arc'
  
  -- Finding content
  finding_type TEXT NOT NULL CHECK (finding_type IN ('critical', 'warning', 'suggestion', 'journey')),
  severity TEXT NOT NULL CHECK (severity IN ('high', 'medium', 'low')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  recommendation TEXT,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'acknowledged', 'in_progress', 'fixed', 'verified', 'wont_fix', 'duplicate')),
  status_changed_at TIMESTAMP WITH TIME ZONE,
  status_changed_by TEXT, -- user who changed status
  
  -- AI metadata
  ai_confidence NUMERIC(3,2), -- 0.00 to 1.00
  ai_model_used TEXT,
  raw_ai_response JSONB,
  
  -- Context data
  page_content_snapshot JSONB, -- What Ralph analyzed
  user_flow_snapshot JSONB, -- User journey at time of finding
  
  -- Tracking
  first_detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  occurrence_count INTEGER NOT NULL DEFAULT 1,
  
  -- Export tracking
  exported_at TIMESTAMP WITH TIME ZONE,
  export_format TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Prevent duplicate findings
  CONSTRAINT unique_finding_hash UNIQUE (finding_hash)
);

-- Index for fast lookups
CREATE INDEX idx_ralph_findings_page ON public.ralph_wiggum_findings(page_route);
CREATE INDEX idx_ralph_findings_status ON public.ralph_wiggum_findings(status);
CREATE INDEX idx_ralph_findings_type ON public.ralph_wiggum_findings(finding_type);
CREATE INDEX idx_ralph_findings_module ON public.ralph_wiggum_findings(module_name);
CREATE INDEX idx_ralph_findings_hash ON public.ralph_wiggum_findings(finding_hash);

-- Enable RLS
ALTER TABLE public.ralph_wiggum_findings ENABLE ROW LEVEL SECURITY;

-- RLS policies - Allow all authenticated users (dev only tool)
CREATE POLICY "Allow authenticated read" 
ON public.ralph_wiggum_findings 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated insert" 
ON public.ralph_wiggum_findings 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated update" 
ON public.ralph_wiggum_findings 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated delete" 
ON public.ralph_wiggum_findings 
FOR DELETE 
TO authenticated
USING (true);

-- Auto-update timestamp trigger
CREATE TRIGGER update_ralph_findings_updated_at
BEFORE UPDATE ON public.ralph_wiggum_findings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();