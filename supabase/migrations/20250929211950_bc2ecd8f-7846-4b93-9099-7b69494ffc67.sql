-- Add RLS policies for analytics tables to allow reading aggregated/approved data

-- Genie conversation analytics - allow reading for brand config owners
DROP POLICY IF EXISTS "Users can view analytics for their brand configs" ON genie_conversation_analytics;
CREATE POLICY "Users can view analytics for their brand configs"
ON genie_conversation_analytics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM genie_brand_configs
    WHERE genie_brand_configs.id = genie_conversation_analytics.brand_config_id
    AND genie_brand_configs.created_by = auth.uid()
  )
  OR is_admin_user_safe(auth.uid())
);

-- Genie domain verifications - allow reading for brand config owners
DROP POLICY IF EXISTS "Users can view domains for their brand configs" ON genie_domain_verifications;
CREATE POLICY "Users can view domains for their brand configs"
ON genie_domain_verifications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM genie_brand_configs
    WHERE genie_brand_configs.id = genie_domain_verifications.brand_config_id
    AND genie_brand_configs.created_by = auth.uid()
  )
  OR is_admin_user_safe(auth.uid())
);

-- Genie deployments - allow reading for brand config owners
DROP POLICY IF EXISTS "Users can view deployments for their brand configs" ON genie_deployments;
CREATE POLICY "Users can view deployments for their brand configs"
ON genie_deployments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM genie_brand_configs
    WHERE genie_brand_configs.id = genie_deployments.brand_config_id
    AND genie_brand_configs.created_by = auth.uid()
  )
  OR is_admin_user_safe(auth.uid())
);

-- Genie IP tracking - allow reading for brand config owners
DROP POLICY IF EXISTS "Users can view IP tracking for their brand configs" ON genie_ip_tracking;
CREATE POLICY "Users can view IP tracking for their brand configs"
ON genie_ip_tracking
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM genie_brand_configs
    WHERE genie_brand_configs.id = genie_ip_tracking.brand_config_id
    AND genie_brand_configs.created_by = auth.uid()
  )
  OR is_admin_user_safe(auth.uid())
);

-- Knowledge base - allow reading approved entries
DROP POLICY IF EXISTS "Users can view approved knowledge base entries" ON knowledge_base;
CREATE POLICY "Users can view approved knowledge base entries"
ON knowledge_base
FOR SELECT
USING (
  status = 'approved'
  OR EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('superAdmin', 'onboardingTeam')
  )
);

-- Agent knowledge bases - allow reading for agent owners
DROP POLICY IF EXISTS "Users can view knowledge bases for their agents" ON agent_knowledge_bases;
CREATE POLICY "Users can view knowledge bases for their agents"
ON agent_knowledge_bases
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM agents
    WHERE agents.id = agent_knowledge_bases.agent_id
    AND agents.created_by = auth.uid()
  )
  OR is_admin_user_safe(auth.uid())
);

-- Agent conversations - allow reading for conversation owners  
DROP POLICY IF EXISTS "Users can view their agent conversations" ON agent_conversations;
CREATE POLICY "Users can view their agent conversations"
ON agent_conversations
FOR SELECT
USING (
  auth.uid() = user_id
  OR is_admin_user_safe(auth.uid())
);