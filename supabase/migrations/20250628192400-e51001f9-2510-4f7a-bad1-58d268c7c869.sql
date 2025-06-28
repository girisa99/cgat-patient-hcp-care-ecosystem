
-- Create table to track issue fixes with daily progress
CREATE TABLE public.issue_fixes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  issue_type TEXT NOT NULL,
  issue_message TEXT NOT NULL,
  issue_source TEXT NOT NULL,
  issue_severity TEXT NOT NULL CHECK (issue_severity IN ('critical', 'high', 'medium', 'low')),
  category TEXT NOT NULL CHECK (category IN ('Security', 'Database', 'Code Quality', 'UI/UX', 'Performance')),
  fix_method TEXT NOT NULL CHECK (fix_method IN ('manual', 'automatic', 'backend_detected')),
  fixed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create table to track current active issues
CREATE TABLE public.active_issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_type TEXT NOT NULL,
  issue_message TEXT NOT NULL,
  issue_source TEXT NOT NULL,
  issue_severity TEXT NOT NULL CHECK (issue_severity IN ('critical', 'high', 'medium', 'low')),
  category TEXT NOT NULL CHECK (category IN ('Security', 'Database', 'Code Quality', 'UI/UX', 'Performance')),
  first_detected TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'ignored')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.issue_fixes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_issues ENABLE ROW LEVEL SECURITY;

-- RLS policies for issue_fixes
CREATE POLICY "Users can view their own issue fixes" 
  ON public.issue_fixes 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own issue fixes" 
  ON public.issue_fixes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS policies for active_issues (accessible to all authenticated users for system-wide issues)
CREATE POLICY "Authenticated users can view active issues" 
  ON public.active_issues 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can manage active issues" 
  ON public.active_issues 
  FOR ALL 
  TO authenticated 
  USING (true);

-- Add indexes for better performance
CREATE INDEX idx_issue_fixes_user_date ON public.issue_fixes(user_id, fixed_at DESC);
CREATE INDEX idx_issue_fixes_category_date ON public.issue_fixes(category, fixed_at DESC);
CREATE INDEX idx_active_issues_status ON public.active_issues(status);
CREATE INDEX idx_active_issues_category ON public.active_issues(category);

-- Create function to get daily fix statistics (FIXED GROUP BY issue)
CREATE OR REPLACE FUNCTION public.get_daily_fix_stats(
  days_back INTEGER DEFAULT 7,
  target_user_id UUID DEFAULT auth.uid()
)
RETURNS TABLE(
  fix_date DATE,
  category TEXT,
  fix_count BIGINT,
  severity_breakdown JSONB
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT 
    fix_date,
    category,
    COUNT(*) as fix_count,
    jsonb_object_agg(issue_severity, severity_count) as severity_breakdown
  FROM (
    SELECT 
      DATE(fixed_at) as fix_date,
      category,
      issue_severity,
      COUNT(*) as severity_count
    FROM public.issue_fixes
    WHERE user_id = target_user_id 
    AND fixed_at >= (CURRENT_DATE - INTERVAL '1 day' * days_back)
    GROUP BY DATE(fixed_at), category, issue_severity
  ) grouped
  GROUP BY fix_date, category
  ORDER BY fix_date DESC, category;
$$;

-- Create function to sync active issues
CREATE OR REPLACE FUNCTION public.sync_active_issues(issues_data JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Clear existing active issues
  DELETE FROM public.active_issues;
  
  -- Insert new active issues from the provided data
  INSERT INTO public.active_issues (
    issue_type, issue_message, issue_source, issue_severity, category, status
  )
  SELECT 
    (issue->>'type')::TEXT,
    (issue->>'message')::TEXT,
    (issue->>'source')::TEXT,
    (issue->>'severity')::TEXT,
    CASE 
      WHEN (issue->>'source') LIKE '%Security%' THEN 'Security'
      WHEN (issue->>'source') LIKE '%Database%' THEN 'Database'
      WHEN (issue->>'source') LIKE '%Code%' THEN 'Code Quality'
      WHEN (issue->>'source') LIKE '%UI%' OR (issue->>'source') LIKE '%UX%' THEN 'UI/UX'
      ELSE 'Performance'
    END,
    'active'
  FROM jsonb_array_elements(issues_data) AS issue;
END;
$$;
