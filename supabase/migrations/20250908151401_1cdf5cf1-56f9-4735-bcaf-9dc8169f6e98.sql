-- Fix security definer issues and optimize slow queries
-- Add missing indexes for slow queries
CREATE INDEX IF NOT EXISTS idx_agents_created_by_status ON agents(created_by, status);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_user_id_status ON agent_sessions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_profiles_id_email ON profiles(id, email);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_role_id ON user_roles(user_id, role_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id_created_at ON audit_logs(user_id, created_at DESC);

-- Optimize database statistics
ANALYZE agents, agent_sessions, profiles, user_roles, audit_logs, facilities, modules;

-- Create optimized function to clean up performance bottlenecks
CREATE OR REPLACE FUNCTION public.optimize_slow_queries()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Reindex frequently queried tables
  REINDEX TABLE agents;
  REINDEX TABLE agent_sessions;
  REINDEX TABLE profiles;
  
  -- Update table statistics
  ANALYZE agents, agent_sessions, profiles, user_roles, facilities, modules;
  
  -- Clean up unused connections
  SELECT pg_terminate_backend(pid) 
  FROM pg_stat_activity 
  WHERE state = 'idle' 
  AND state_change < now() - interval '10 minutes'
  AND pid <> pg_backend_pid();
  
END;
$$;

-- Fix security definer issues by setting proper search path on functions
ALTER FUNCTION public.has_role(uuid, user_role) SET search_path = 'public';
ALTER FUNCTION public.is_admin_user(uuid) SET search_path = 'public';
ALTER FUNCTION public.is_demo_user(uuid) SET search_path = 'public';
ALTER FUNCTION public.get_user_roles(uuid) SET search_path = 'public';

-- Create vacuum and analyze scheduler function
CREATE OR REPLACE FUNCTION public.schedule_maintenance()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Vacuum and analyze high-traffic tables
  VACUUM ANALYZE agents;
  VACUUM ANALYZE agent_sessions;
  VACUUM ANALYZE profiles;
  VACUUM ANALYZE audit_logs;
  
  -- Log maintenance completion
  INSERT INTO audit_logs (user_id, action, table_name, additional_context)
  VALUES (
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    'database_maintenance',
    'system',
    jsonb_build_object('maintenance_type', 'scheduled_vacuum_analyze', 'timestamp', now())
  );
END;
$$;