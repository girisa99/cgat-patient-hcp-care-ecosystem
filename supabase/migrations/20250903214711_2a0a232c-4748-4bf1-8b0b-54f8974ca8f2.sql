-- Clean up excessive agent sessions, keeping only the latest 3 per user
WITH ranked_sessions AS (
  SELECT id, user_id,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY updated_at DESC) as rn
  FROM agent_sessions
  WHERE status = 'draft'
)
DELETE FROM agent_sessions 
WHERE id IN (
  SELECT id FROM ranked_sessions WHERE rn > 3
);

-- Update existing sessions to only save on manual action
UPDATE agent_sessions 
SET updated_at = updated_at 
WHERE status = 'draft' AND updated_at < now() - interval '1 hour';