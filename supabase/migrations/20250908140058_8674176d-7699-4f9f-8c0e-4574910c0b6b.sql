-- Add missing performance-critical indexes based on analysis

-- Index for profiles date filtering (missing from recommendations)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_created_at 
ON profiles(created_at DESC);

-- Composite index for common agent_sessions queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_sessions_status_updated 
ON agent_sessions(status, updated_at DESC);

-- Index for audit_logs performance (high frequency table)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_created_user 
ON audit_logs(created_at DESC, user_id);

-- Index for active_issues severity filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_active_issues_severity_created 
ON active_issues(issue_severity, created_at DESC);

-- Optimize JSONB queries on agent configurations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agents_configuration_gin 
ON agents USING GIN(configuration);

-- Index for user preferences frequent updates
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_preferences_user_updated 
ON user_preferences(user_id, updated_at DESC);

-- Performance optimization function for memory cleanup
CREATE OR REPLACE FUNCTION optimize_database_performance()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Analyze tables for better query planning
  ANALYZE profiles, agent_sessions, agents, user_roles, active_issues, audit_logs;
  
  -- Log optimization
  INSERT INTO audit_logs (user_id, action, table_name, additional_context)
  VALUES (
    auth.uid(),
    'database_optimization',
    'system',
    jsonb_build_object('optimization_type', 'performance_indexes', 'timestamp', now())
  );
END;
$$;