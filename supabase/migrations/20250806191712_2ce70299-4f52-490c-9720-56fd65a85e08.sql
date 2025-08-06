-- Add missing foreign key relationships for better data integrity

-- agent_sessions to agent_templates
ALTER TABLE agent_sessions 
ADD CONSTRAINT fk_agent_sessions_template 
FOREIGN KEY (template_id) REFERENCES agent_templates(id) ON DELETE SET NULL;

-- agents to agent_templates  
ALTER TABLE agents 
ADD CONSTRAINT fk_agents_template 
FOREIGN KEY (template_id) REFERENCES agent_templates(id) ON DELETE SET NULL;

-- agent_actions to agents
ALTER TABLE agent_actions 
ADD CONSTRAINT fk_agent_actions_agent 
FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE;

-- agent_channel_deployments to agents
ALTER TABLE agent_channel_deployments 
ADD CONSTRAINT fk_agent_channel_deployments_agent 
FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE;

-- agent_conversations to agents
ALTER TABLE agent_conversations 
ADD CONSTRAINT fk_agent_conversations_agent 
FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE;

-- agent_test_runs to agents
ALTER TABLE agent_test_runs 
ADD CONSTRAINT fk_agent_test_runs_agent 
FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE;

-- agent_knowledge_bases to agents
ALTER TABLE agent_knowledge_bases 
ADD CONSTRAINT fk_agent_knowledge_bases_agent 
FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE;

-- agent_user_associations to agents
ALTER TABLE agent_user_associations 
ADD CONSTRAINT fk_agent_user_associations_agent 
FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE;

-- agent_organization_mapping to agents
ALTER TABLE agent_organization_mapping 
ADD CONSTRAINT fk_agent_organization_mapping_agent 
FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE;

-- Create a function to automatically sync agent deployment status
CREATE OR REPLACE FUNCTION sync_agent_deployment_status()
RETURNS TRIGGER AS $$
BEGIN
  -- When an agent is deployed to a channel, update agent status
  IF NEW.deployment_status = 'deployed' THEN
    UPDATE agents 
    SET status = 'deployed', updated_at = now() 
    WHERE id = NEW.agent_id;
  ELSIF NEW.deployment_status = 'paused' THEN
    UPDATE agents 
    SET status = 'paused', updated_at = now() 
    WHERE id = NEW.agent_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to sync agent status when deployment changes
CREATE TRIGGER agent_deployment_status_sync
  AFTER INSERT OR UPDATE ON agent_channel_deployments
  FOR EACH ROW
  EXECUTE FUNCTION sync_agent_deployment_status();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_created_by ON agents(created_by);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_user_id ON agent_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_status ON agent_sessions(status);
CREATE INDEX IF NOT EXISTS idx_agent_channel_deployments_agent ON agent_channel_deployments(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_agent ON agent_conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_user ON agent_conversations(user_id);