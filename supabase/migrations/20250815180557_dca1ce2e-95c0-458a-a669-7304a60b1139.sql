-- Create a secure RPC to clean up a user's agent sessions and agents by status
CREATE OR REPLACE FUNCTION public.cleanup_user_agent_work(
  p_user_id uuid DEFAULT auth.uid(),
  p_statuses text[] DEFAULT ARRAY['draft','in_progress']
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_agent_sessions integer := 0;
  deleted_agents integer := 0;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'User ID is required';
  END IF;

  -- Only allow self clean-up or admins
  IF p_user_id <> auth.uid() AND NOT is_admin_user_safe(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized to clean up for this user';
  END IF;

  -- Delete matching agent sessions
  DELETE FROM agent_sessions
  WHERE user_id = p_user_id
    AND status = ANY(p_statuses);
  GET DIAGNOSTICS deleted_agent_sessions = ROW_COUNT;

  -- Delete matching agents
  DELETE FROM agents
  WHERE created_by = p_user_id
    AND status = ANY(p_statuses);
  GET DIAGNOSTICS deleted_agents = ROW_COUNT;

  RETURN jsonb_build_object(
    'deleted_agent_sessions', deleted_agent_sessions,
    'deleted_agents', deleted_agents,
    'total_deleted', deleted_agent_sessions + deleted_agents,
    'statuses', p_statuses,
    'target_user_id', p_user_id,
    'timestamp', now()
  );
END;
$$;