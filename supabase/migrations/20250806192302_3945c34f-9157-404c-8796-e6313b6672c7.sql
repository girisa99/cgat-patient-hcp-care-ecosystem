-- Add unique constraint for agent names to prevent duplicates
ALTER TABLE agents ADD CONSTRAINT unique_agent_name_per_user UNIQUE (name, created_by);
ALTER TABLE agent_sessions ADD CONSTRAINT unique_session_name_per_user UNIQUE (name, user_id);

-- Create function to check for duplicate agent names
CREATE OR REPLACE FUNCTION check_duplicate_agent_name(p_name text, p_user_id uuid, p_exclude_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if agent name exists for this user (excluding current record if updating)
  RETURN EXISTS (
    SELECT 1 FROM agents 
    WHERE name = p_name 
    AND created_by = p_user_id 
    AND (p_exclude_id IS NULL OR id != p_exclude_id)
  ) OR EXISTS (
    SELECT 1 FROM agent_sessions 
    WHERE name = p_name 
    AND user_id = p_user_id 
    AND (p_exclude_id IS NULL OR id != p_exclude_id)
  );
END;
$$;

-- Create function to find old draft agents (older than 7 days)
CREATE OR REPLACE FUNCTION get_old_draft_agents(p_user_id uuid DEFAULT NULL)
RETURNS TABLE(
  id uuid,
  name text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  days_old integer,
  table_source text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  -- Get old draft agents from agents table
  SELECT 
    a.id,
    a.name,
    a.created_at,
    a.updated_at,
    EXTRACT(days FROM (now() - a.updated_at))::integer as days_old,
    'agents'::text as table_source
  FROM agents a
  WHERE a.status = 'draft'
  AND a.updated_at < (now() - interval '7 days')
  AND (p_user_id IS NULL OR a.created_by = p_user_id)
  
  UNION ALL
  
  -- Get old draft sessions from agent_sessions table
  SELECT 
    s.id,
    s.name,
    s.created_at,
    s.updated_at,
    EXTRACT(days FROM (now() - s.updated_at))::integer as days_old,
    'agent_sessions'::text as table_source
  FROM agent_sessions s
  WHERE s.status = 'draft'
  AND s.updated_at < (now() - interval '7 days')
  AND (p_user_id IS NULL OR s.user_id = p_user_id)
  
  ORDER BY updated_at ASC;
END;
$$;

-- Create function to cleanup old draft agents
CREATE OR REPLACE FUNCTION cleanup_old_draft_agents(p_user_id uuid DEFAULT NULL, p_confirm boolean DEFAULT false)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  old_agents_count integer := 0;
  old_sessions_count integer := 0;
  result jsonb;
BEGIN
  -- If not confirmed, just return count
  IF NOT p_confirm THEN
    SELECT COUNT(*) INTO old_agents_count
    FROM agents 
    WHERE status = 'draft' 
    AND updated_at < (now() - interval '7 days')
    AND (p_user_id IS NULL OR created_by = p_user_id);
    
    SELECT COUNT(*) INTO old_sessions_count
    FROM agent_sessions 
    WHERE status = 'draft' 
    AND updated_at < (now() - interval '7 days')
    AND (p_user_id IS NULL OR user_id = p_user_id);
    
    RETURN jsonb_build_object(
      'preview_mode', true,
      'old_agents_count', old_agents_count,
      'old_sessions_count', old_sessions_count,
      'total_count', old_agents_count + old_sessions_count
    );
  END IF;
  
  -- Delete old draft agents
  DELETE FROM agents 
  WHERE status = 'draft' 
  AND updated_at < (now() - interval '7 days')
  AND (p_user_id IS NULL OR created_by = p_user_id);
  
  GET DIAGNOSTICS old_agents_count = ROW_COUNT;
  
  -- Delete old draft sessions
  DELETE FROM agent_sessions 
  WHERE status = 'draft' 
  AND updated_at < (now() - interval '7 days')
  AND (p_user_id IS NULL OR user_id = p_user_id);
  
  GET DIAGNOSTICS old_sessions_count = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'preview_mode', false,
    'deleted_agents', old_agents_count,
    'deleted_sessions', old_sessions_count,
    'total_deleted', old_agents_count + old_sessions_count,
    'cleanup_timestamp', now()
  );
END;
$$;

-- Create function to automatically update updated_at when agents are modified
CREATE OR REPLACE FUNCTION update_agent_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add triggers to update updated_at automatically
CREATE TRIGGER agent_update_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_updated_at();

CREATE TRIGGER agent_session_update_updated_at
  BEFORE UPDATE ON agent_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_updated_at();