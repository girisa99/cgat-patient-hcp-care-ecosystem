-- Fix security issues by setting proper search_path
ALTER FUNCTION public.update_updated_at_column() SET search_path = 'public';

-- Create security definer function for better RLS handling
CREATE OR REPLACE FUNCTION public.user_can_access_node_config(config_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.nodes_config nc
    JOIN public.agent_sessions s ON nc.agent_session_id = s.id
    WHERE nc.id = config_id AND s.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.nodes_config nc
    JOIN public.agent_workflows w ON nc.workflow_id = w.id
    WHERE nc.id = config_id AND w.created_by = auth.uid()
  );
$$;