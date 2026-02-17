-- Fix Security Linter Warning: Function Search Path Mutable
-- Update function to have immutable search path

CREATE OR REPLACE FUNCTION log_sensitive_data_access(
  table_name TEXT,
  operation_type TEXT,
  record_id UUID DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    additional_context
  ) VALUES (
    auth.uid(),
    operation_type || ' on ' || table_name,
    table_name,
    record_id,
    jsonb_build_object(
      'timestamp', now(),
      'session_id', current_setting('request.jwt.claims', true)::jsonb->>'session_id',
      'sensitive_data_access', true
    )
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the main operation
    NULL;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public'; -- Fix for security linter warning