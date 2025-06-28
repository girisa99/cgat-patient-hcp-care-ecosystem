
-- Fix the sync_active_issues function to handle the DELETE operation properly
CREATE OR REPLACE FUNCTION public.sync_active_issues(issues_data jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Clear existing active issues with a proper WHERE clause
  DELETE FROM public.active_issues WHERE status = 'active';
  
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
$function$
