-- First, let's identify and clean up duplicate agent names
-- Keep the most recent agent for each name and user combination

-- Clean up duplicate agents (keep the most recent one)
WITH duplicates AS (
  SELECT 
    name, 
    created_by,
    ARRAY_AGG(id ORDER BY updated_at DESC) as ids
  FROM agents 
  GROUP BY name, created_by 
  HAVING COUNT(*) > 1
),
to_delete AS (
  SELECT 
    UNNEST(ids[2:]) as id_to_delete
  FROM duplicates
)
DELETE FROM agents 
WHERE id IN (SELECT id_to_delete FROM to_delete);

-- Clean up duplicate agent sessions (keep the most recent one)
WITH session_duplicates AS (
  SELECT 
    name, 
    user_id,
    ARRAY_AGG(id ORDER BY updated_at DESC) as ids
  FROM agent_sessions 
  GROUP BY name, user_id 
  HAVING COUNT(*) > 1
),
sessions_to_delete AS (
  SELECT 
    UNNEST(ids[2:]) as id_to_delete
  FROM session_duplicates
)
DELETE FROM agent_sessions 
WHERE id IN (SELECT id_to_delete FROM sessions_to_delete);

-- Now add unique constraints
ALTER TABLE agents ADD CONSTRAINT unique_agent_name_per_user UNIQUE (name, created_by);
ALTER TABLE agent_sessions ADD CONSTRAINT unique_session_name_per_user UNIQUE (name, user_id);