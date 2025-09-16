-- Drop existing function and recreate with improved functionality
DROP FUNCTION IF EXISTS public.optimize_database_performance();

-- Enhanced database performance optimization function
CREATE OR REPLACE FUNCTION public.optimize_database_performance()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  optimization_result jsonb;
  table_rec RECORD;
  total_optimized integer := 0;
  start_time timestamp := now();
BEGIN
  -- Analyze key tables for better query planning
  ANALYZE profiles, agent_sessions, agents, user_roles, facilities, modules, audit_logs;
  
  -- Clean up old performance data
  DELETE FROM agent_performance_metrics 
  WHERE measurement_timestamp < now() - interval '30 days';
  
  -- Vacuum analyze high-traffic tables
  VACUUM ANALYZE agent_sessions;
  VACUUM ANALYZE agents; 
  VACUUM ANALYZE profiles;
  VACUUM ANALYZE user_roles;
  
  -- Count optimized tables
  total_optimized := 7;
  
  -- Build result
  optimization_result := jsonb_build_object(
    'optimization_completed_at', now(),
    'duration_seconds', EXTRACT(EPOCH FROM (now() - start_time)),
    'tables_optimized', total_optimized,
    'operations_performed', jsonb_build_array(
      'ANALYZE on key tables',
      'Cleaned old performance metrics', 
      'VACUUM ANALYZE on high-traffic tables',
      'Updated table statistics'
    ),
    'recommendations', jsonb_build_array(
      'Consider VACUUM FULL for bloated tables',
      'Add composite indexes on frequently queried columns',
      'Monitor table bloat regularly',
      'Implement automated maintenance jobs'
    )
  );
  
  -- Log the optimization
  INSERT INTO audit_logs (user_id, action, table_name, additional_context)
  VALUES (
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    'database_performance_optimization',
    'system',
    optimization_result
  );
  
  RETURN optimization_result;
END;
$$;

-- Function to get database bloat information
CREATE OR REPLACE FUNCTION public.get_database_bloat_info()
RETURNS TABLE(
  table_name text,
  live_rows bigint,
  dead_rows bigint,
  total_size text,
  bloat_ratio numeric,
  recommendation text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname || '.' || relname::text as table_name,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||relname)) as total_size,
    CASE 
      WHEN n_live_tup > 0 THEN 
        ROUND((n_dead_tup::numeric / n_live_tup::numeric) * 100, 2)
      ELSE 0 
    END as bloat_ratio,
    CASE 
      WHEN n_dead_tup > n_live_tup THEN 'VACUUM FULL recommended'
      WHEN n_dead_tup > (n_live_tup * 0.2) THEN 'VACUUM recommended'
      ELSE 'Good'
    END as recommendation
  FROM pg_stat_user_tables
  WHERE schemaname = 'public'
    AND n_live_tup > 0
  ORDER BY 
    CASE 
      WHEN n_live_tup > 0 THEN (n_dead_tup::numeric / n_live_tup::numeric)
      ELSE 0 
    END DESC;
END;
$$;