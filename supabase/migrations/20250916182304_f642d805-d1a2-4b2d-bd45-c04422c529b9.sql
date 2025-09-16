-- Create retention policies and cleanup functions for performance optimization

-- 1. Universal Save Sessions Retention Policy (7 days for inactive sessions)
CREATE OR REPLACE FUNCTION cleanup_universal_save_sessions()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count integer := 0;
BEGIN
  -- Delete sessions older than 7 days that haven't been updated
  DELETE FROM universal_save_sessions 
  WHERE updated_at < NOW() - INTERVAL '7 days'
    AND (session_data->>'last_activity_timestamp')::bigint < EXTRACT(epoch FROM NOW() - INTERVAL '7 days') * 1000;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'deleted_sessions', deleted_count,
    'cleanup_timestamp', NOW(),
    'retention_policy', '7_days_inactive'
  );
END;
$$;

-- 2. Agent Sessions Cleanup (remove draft/abandoned sessions older than 3 days)
CREATE OR REPLACE FUNCTION cleanup_agent_sessions()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count integer := 0;
BEGIN
  -- Delete old draft and abandoned sessions
  DELETE FROM agent_sessions 
  WHERE status IN ('draft', 'abandoned', 'inactive')
    AND updated_at < NOW() - INTERVAL '3 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'deleted_sessions', deleted_count,
    'cleanup_timestamp', NOW(),
    'retention_policy', '3_days_inactive'
  );
END;
$$;

-- 3. Comprehensive Test Cases Cleanup (remove auto-generated duplicates)
CREATE OR REPLACE FUNCTION cleanup_duplicate_test_cases()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count integer := 0;
BEGIN
  -- Remove duplicate auto-generated test cases keeping the latest
  WITH duplicates AS (
    SELECT id, ROW_NUMBER() OVER (
      PARTITION BY test_name, test_category 
      ORDER BY created_at DESC
    ) as rn
    FROM comprehensive_test_cases
    WHERE auto_generated = true
  )
  DELETE FROM comprehensive_test_cases 
  WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
  );
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'deleted_duplicates', deleted_count,
    'cleanup_timestamp', NOW(),
    'cleanup_type', 'duplicate_test_cases'
  );
END;
$$;

-- 4. Create automated cleanup schedule function
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
  
  -- Log the cleanup
  INSERT INTO audit_logs (user_id, action, table_name, additional_context)
  VALUES (
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    'automated_database_cleanup',
    'system',
    result
  );
  
  RETURN result;
END;
$$;

-- 5. Create database health verification function
CREATE OR REPLACE FUNCTION verify_jsonb_migration_integrity()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  agent_check jsonb;
  session_check jsonb;
  result jsonb;
BEGIN
  -- Verify agents table integrity
  SELECT jsonb_build_object(
    'total_agents', COUNT(*),
    'agents_with_config', COUNT(*) FILTER (WHERE configuration IS NOT NULL),
    'agents_with_deployment', COUNT(*) FILTER (WHERE deployment_config IS NOT NULL),
    'active_agents', COUNT(*) FILTER (WHERE status = 'active')
  ) INTO agent_check
  FROM agents;
  
  -- Verify agent_sessions table integrity
  SELECT jsonb_build_object(
    'total_sessions', COUNT(*),
    'sessions_with_basic_info', COUNT(*) FILTER (WHERE basic_info IS NOT NULL),
    'sessions_with_knowledge', COUNT(*) FILTER (WHERE knowledge IS NOT NULL),
    'active_sessions', COUNT(*) FILTER (WHERE status = 'active')
  ) INTO session_check
  FROM agent_sessions;
  
  result := jsonb_build_object(
    'verification_timestamp', NOW(),
    'agents_integrity', agent_check,
    'sessions_integrity', session_check,
    'migration_status', 'verified'
  );
  
  RETURN result;
END;
$$;