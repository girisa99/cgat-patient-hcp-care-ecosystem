-- Fix comprehensive system update function to use correct audit_logs schema

CREATE OR REPLACE FUNCTION run_comprehensive_system_update()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb := '{}';
  cleanup_result jsonb;
  api_update_result jsonb;
  testing_update_result jsonb;
  system_status jsonb;
BEGIN
  -- Run all update functions
  SELECT cleanup_universal_save_sessions() INTO cleanup_result;
  SELECT update_api_services_documentation() INTO api_update_result;
  SELECT update_testing_suite_comprehensive() INTO testing_update_result;
  SELECT get_system_integration_status() INTO system_status;
  
  -- Combine results
  result := jsonb_build_object(
    'cleanup_results', cleanup_result,
    'api_documentation_update', api_update_result,
    'testing_suite_update', testing_update_result,
    'system_integration_status', system_status,
    'comprehensive_update_completed', true,
    'timestamp', NOW()
  );
  
  -- Log the comprehensive update (check if additional_context column exists)
  BEGIN
    INSERT INTO audit_logs (user_id, action, table_name, additional_context)
    VALUES (
      COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
      'comprehensive_system_integration_update',
      'system',
      result
    );
  EXCEPTION WHEN OTHERS THEN
    -- If audit_logs doesn't have additional_context column, log without it
    INSERT INTO audit_logs (user_id, action, table_name)
    VALUES (
      COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
      'comprehensive_system_integration_update',
      'system'
    );
  END;
  
  RETURN result;
END;
$$;