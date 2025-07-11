
-- Add audit triggers to active_issues and issue_fixes tables
CREATE TRIGGER audit_active_issues_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.active_issues
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_issue_fixes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.issue_fixes
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Create a function to log verification system activities
CREATE OR REPLACE FUNCTION public.log_verification_activity(
  activity_type TEXT,
  activity_description TEXT,
  metadata_info JSONB DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values,
    ip_address
  )
  VALUES (
    auth.uid(),
    activity_type,
    'verification_system',
    gen_random_uuid(), -- Generate a unique ID for verification activities
    NULL,
    jsonb_build_object(
      'activity', activity_description,
      'timestamp', now(),
      'metadata', metadata_info
    ),
    NULL
  );
END;
$$;
