-- Clean up development sessions, keeping only sessions with actual saved agents
DELETE FROM agent_sessions 
WHERE id NOT IN (
  SELECT DISTINCT session_id 
  FROM agents 
  WHERE session_id IS NOT NULL
) 
AND created_at < NOW() - INTERVAL '7 days';

-- Update agent_sessions to only create when agent is actually saved
-- Add constraint to prevent orphaned sessions
ALTER TABLE agent_sessions 
ADD CONSTRAINT agent_sessions_purpose_check 
CHECK (purpose IN ('development', 'production', 'template'));

-- Clean up any workflow data from development sessions
DELETE FROM agent_workflows 
WHERE session_id NOT IN (
  SELECT id FROM agent_sessions
);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_agent_sessions_cleanup 
ON agent_sessions(created_at, purpose) 
WHERE purpose = 'development';