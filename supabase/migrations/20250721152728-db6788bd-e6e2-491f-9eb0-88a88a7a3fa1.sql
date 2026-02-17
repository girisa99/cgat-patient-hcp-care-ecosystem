-- Update agent_sessions table to match our AgentSession interface
ALTER TABLE agent_sessions 
ADD COLUMN IF NOT EXISTS template_id UUID,
ADD COLUMN IF NOT EXISTS template_type TEXT CHECK (template_type IN ('ai_generated', 'custom', 'system')),
ADD COLUMN IF NOT EXISTS current_step TEXT CHECK (current_step IN ('basic_info', 'canvas', 'actions', 'connectors', 'knowledge', 'rag', 'deploy')),
ADD COLUMN IF NOT EXISTS basic_info JSONB,
ADD COLUMN IF NOT EXISTS canvas JSONB,
ADD COLUMN IF NOT EXISTS actions JSONB,
ADD COLUMN IF NOT EXISTS connectors JSONB,
ADD COLUMN IF NOT EXISTS knowledge JSONB,
ADD COLUMN IF NOT EXISTS rag JSONB,
ADD COLUMN IF NOT EXISTS deployment JSONB;

-- Update the status column to match our expected values
ALTER TABLE agent_sessions 
DROP CONSTRAINT IF EXISTS agent_sessions_status_check;

ALTER TABLE agent_sessions 
ADD CONSTRAINT agent_sessions_status_check CHECK (status IN ('draft', 'in_progress', 'ready_to_deploy', 'deployed'));

-- Set default values for required columns (fixed syntax)
UPDATE agent_sessions SET current_step = 'basic_info' WHERE current_step IS NULL;
UPDATE agent_sessions SET template_type = 'custom' WHERE template_type IS NULL;
UPDATE agent_sessions SET status = 'draft' WHERE status IS NULL;

-- Create table for tracking API assignments to tasks/actions
CREATE TABLE IF NOT EXISTS agent_api_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_session_id UUID NOT NULL REFERENCES agent_sessions(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL,
  task_type TEXT NOT NULL CHECK (task_type IN ('action', 'workflow_step', 'connector')),
  assigned_api_service TEXT NOT NULL,
  api_configuration JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE agent_api_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for API assignments
CREATE POLICY "Users can manage their own API assignments"
ON agent_api_assignments
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM agent_sessions 
    WHERE agent_sessions.id = agent_api_assignments.agent_session_id 
    AND agent_sessions.user_id = auth.uid()
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agent_sessions_user_id ON agent_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_status ON agent_sessions(status);
CREATE INDEX IF NOT EXISTS idx_agent_api_assignments_session_id ON agent_api_assignments(agent_session_id);