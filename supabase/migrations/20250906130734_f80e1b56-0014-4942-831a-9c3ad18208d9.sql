-- Clean up old development sessions (keep only sessions from last 7 days)
DELETE FROM agent_sessions 
WHERE created_at < NOW() - INTERVAL '7 days';

-- Create automatic cleanup function for sessions
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
$$ LANGUAGE plpgsql;

-- Schedule automatic cleanup (runs when triggered)
COMMENT ON FUNCTION auto_cleanup_sessions() IS 'Automatically cleans up old agent sessions to prevent accumulation during development';