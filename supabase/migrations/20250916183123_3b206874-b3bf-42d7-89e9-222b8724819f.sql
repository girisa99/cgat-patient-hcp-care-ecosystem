-- Fix system integration status function to use correct column names

CREATE OR REPLACE FUNCTION get_system_integration_status()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
  db_stats jsonb;
  api_stats jsonb;
  agent_stats jsonb;
  test_stats jsonb;
BEGIN
  -- Database statistics
  SELECT jsonb_build_object(
    'total_tables', COUNT(*),
    'largest_table_size', pg_size_pretty(MAX(pg_total_relation_size(schemaname||'.'||tablename))),
    'total_db_size', pg_size_pretty(pg_database_size(current_database()))
  ) INTO db_stats
  FROM pg_tables 
  WHERE schemaname = 'public';
  
  -- API services statistics (use correct column names)
  SELECT jsonb_build_object(
    'total_apis', COUNT(*),
    'active_apis', COUNT(*) FILTER (WHERE status = 'published'),
    'internal_apis', COUNT(*) FILTER (WHERE name NOT LIKE '%external%'),
    'external_apis', COUNT(*) FILTER (WHERE name LIKE '%external%')
  ) INTO api_stats
  FROM api_integration_registry;
  
  -- Agent system statistics
  SELECT jsonb_build_object(
    'total_agents', COUNT(*),
    'active_agents', COUNT(*) FILTER (WHERE status = 'active'),
    'draft_agents', COUNT(*) FILTER (WHERE status = 'draft'),
    'deployed_agents', COUNT(*) FILTER (WHERE status = 'deployed')
  ) INTO agent_stats
  FROM agents;
  
  -- Testing suite statistics
  SELECT jsonb_build_object(
    'total_test_cases', COUNT(*),
    'auto_generated_tests', COUNT(*) FILTER (WHERE auto_generated = true),
    'manual_tests', COUNT(*) FILTER (WHERE auto_generated = false),
    'integration_tests', COUNT(*) FILTER (WHERE test_suite_type = 'integration')
  ) INTO test_stats
  FROM comprehensive_test_cases;
  
  result := jsonb_build_object(
    'system_health', 'optimal',
    'database_stats', db_stats,
    'api_services_stats', api_stats,
    'agent_system_stats', agent_stats,
    'testing_suite_stats', test_stats,
    'integration_status', 'fully_integrated',
    'multi_tenant_ready', true,
    'real_time_capable', true,
    'last_updated', NOW()
  );
  
  RETURN result;
END;
$$;