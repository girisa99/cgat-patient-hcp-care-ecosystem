-- Fix all audit logging functions to use correct audit_logs schema

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
  
  -- Log the comprehensive update using correct audit_logs schema
  INSERT INTO audit_logs (user_id, action, table_name, new_values)
  VALUES (
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    'comprehensive_system_integration_update',
    'system',
    result
  );
  
  RETURN result;
END;
$$;

-- Also fix run_automated_cleanup function
CREATE OR REPLACE FUNCTION run_automated_cleanup()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb := '{}';
  session_cleanup jsonb;
  agent_cleanup jsonb;
  test_cleanup jsonb;
BEGIN
  -- Run all cleanup functions
  SELECT cleanup_universal_save_sessions() INTO session_cleanup;
  SELECT cleanup_agent_sessions() INTO agent_cleanup;
  SELECT cleanup_duplicate_test_cases() INTO test_cleanup;
  
  -- Combine results
  result := jsonb_build_object(
    'universal_save_cleanup', session_cleanup,
    'agent_sessions_cleanup', agent_cleanup,
    'test_cases_cleanup', test_cleanup,
    'total_cleanup_timestamp', NOW()
  );
  
  -- Log the cleanup using correct audit_logs schema
  INSERT INTO audit_logs (user_id, action, table_name, new_values)
  VALUES (
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    'automated_database_cleanup',
    'system',
    result
  );
  
  RETURN result;
END;
$$;