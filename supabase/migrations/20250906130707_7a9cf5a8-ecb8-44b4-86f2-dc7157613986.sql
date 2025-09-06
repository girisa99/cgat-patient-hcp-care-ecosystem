-- Clean up old development sessions (keep last 10 and any with actual agents)
DELETE FROM agent_sessions 
WHERE created_at < NOW() - INTERVAL '7 days'
AND purpose = 'development'
AND id NOT IN (
  SELECT DISTINCT id 
  FROM agent_sessions 
  ORDER BY created_at DESC 
  LIMIT 10
);

-- Add session cleanup trigger to prevent accumulation
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS TRIGGER AS $$
BEGIN
  -- Clean up sessions older than 24 hours that don't have associated agents
  DELETE FROM agent_sessions 
  WHERE created_at < NOW() - INTERVAL '24 hours'
    AND purpose = 'development'
    AND NOT EXISTS (
      SELECT 1 FROM agents WHERE id = OLD.id
    );
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-cleanup
DROP TRIGGER IF EXISTS trigger_cleanup_sessions ON agent_sessions;
CREATE TRIGGER trigger_cleanup_sessions
  AFTER DELETE ON agent_sessions
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_old_sessions();