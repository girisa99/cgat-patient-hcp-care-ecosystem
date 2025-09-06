-- Fix security issues from the cleanup function
CREATE OR REPLACE FUNCTION auto_cleanup_sessions()
RETURNS void AS $$
BEGIN
  -- Delete sessions older than 7 days that don't have associated agents
  DELETE FROM agent_sessions 
  WHERE created_at < NOW() - INTERVAL '7 days'
    AND NOT EXISTS (
      SELECT 1 FROM agents WHERE agents.id = agent_sessions.id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;