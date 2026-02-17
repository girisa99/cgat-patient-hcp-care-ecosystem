-- Migration: Convert JSONB to Regular Columns for Better Performance (Fixed)
-- This migration extracts commonly used JSONB fields into regular columns

-- 1. Agent Sessions Table - Extract basic_info fields
ALTER TABLE agent_sessions 
ADD COLUMN IF NOT EXISTS agent_name TEXT,
ADD COLUMN IF NOT EXISTS agent_description TEXT,
ADD COLUMN IF NOT EXISTS agent_purpose TEXT,
ADD COLUMN IF NOT EXISTS agent_brand TEXT,
ADD COLUMN IF NOT EXISTS agent_use_case TEXT;

-- Migrate existing data from basic_info JSONB to regular columns
UPDATE agent_sessions 
SET 
    agent_name = basic_info->>'name',
    agent_description = basic_info->>'description',
    agent_purpose = basic_info->>'purpose',
    agent_brand = basic_info->>'brand',
    agent_use_case = basic_info->>'use_case'
WHERE basic_info IS NOT NULL 
    AND (agent_name IS NULL OR agent_description IS NULL);

-- 2. Agents Table - Extract configuration fields  
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS model_provider TEXT,
ADD COLUMN IF NOT EXISTS model_name TEXT,
ADD COLUMN IF NOT EXISTS temperature DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS max_tokens INTEGER,
ADD COLUMN IF NOT EXISTS system_prompt TEXT,
ADD COLUMN IF NOT EXISTS enabled_features TEXT[],
ADD COLUMN IF NOT EXISTS api_rate_limit INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS timeout_seconds INTEGER DEFAULT 30;

-- Migrate existing configuration data
UPDATE agents 
SET 
    model_provider = configuration->>'model_provider',
    model_name = configuration->>'model_name',
    temperature = CASE 
        WHEN configuration->>'temperature' ~ '^[0-9]*\.?[0-9]+$' 
        THEN (configuration->>'temperature')::DECIMAL(3,2) 
        ELSE NULL 
    END,
    max_tokens = CASE 
        WHEN configuration->>'max_tokens' ~ '^[0-9]+$' 
        THEN (configuration->>'max_tokens')::INTEGER 
        ELSE NULL 
    END,
    system_prompt = configuration->>'system_prompt',
    enabled_features = CASE 
        WHEN configuration->'enabled_features' IS NOT NULL 
        THEN ARRAY(SELECT jsonb_array_elements_text(configuration->'enabled_features'))
        ELSE '{}'::TEXT[]
    END,
    api_rate_limit = COALESCE((configuration->>'api_rate_limit')::INTEGER, 100),
    timeout_seconds = COALESCE((configuration->>'timeout_seconds')::INTEGER, 30)
WHERE configuration IS NOT NULL 
    AND (model_provider IS NULL OR model_name IS NULL);

-- 3. API Integration Registry - Extract structured fields
ALTER TABLE api_integration_registry
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS contact_name TEXT,
ADD COLUMN IF NOT EXISTS rate_limit_requests_per_hour INTEGER DEFAULT 1000,
ADD COLUMN IF NOT EXISTS rate_limit_requests_per_minute INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS requires_authentication BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS webhook_url TEXT,
ADD COLUMN IF NOT EXISTS webhook_secret TEXT,
ADD COLUMN IF NOT EXISTS sla_response_time_ms INTEGER,
ADD COLUMN IF NOT EXISTS sla_uptime_percentage DECIMAL(5,2);

-- Migrate contact_info, rate_limits, security_requirements, webhook_config, sla_requirements data
UPDATE api_integration_registry 
SET 
    contact_email = contact_info->>'email',
    contact_phone = contact_info->>'phone',
    contact_name = contact_info->>'name',
    rate_limit_requests_per_hour = COALESCE((rate_limits->>'requests_per_hour')::INTEGER, 1000),
    rate_limit_requests_per_minute = COALESCE((rate_limits->>'requests_per_minute')::INTEGER, 100),
    requires_approval = COALESCE((security_requirements->>'require_approval')::BOOLEAN, true),
    requires_authentication = COALESCE((security_requirements->>'require_authentication')::BOOLEAN, true),
    webhook_url = webhook_config->>'url',
    webhook_secret = webhook_config->>'secret',
    sla_response_time_ms = (sla_requirements->>'response_time_ms')::INTEGER,
    sla_uptime_percentage = (sla_requirements->>'uptime_percentage')::DECIMAL(5,2)
WHERE (contact_info IS NOT NULL OR rate_limits IS NOT NULL OR security_requirements IS NOT NULL)
    AND contact_email IS NULL;

-- 4. API Service Configurations - Extract configuration fields
ALTER TABLE api_service_configurations
ADD COLUMN IF NOT EXISTS api_endpoint TEXT,
ADD COLUMN IF NOT EXISTS auth_type TEXT,
ADD COLUMN IF NOT EXISTS api_key_header TEXT,
ADD COLUMN IF NOT EXISTS timeout_ms INTEGER DEFAULT 30000,
ADD COLUMN IF NOT EXISTS retry_attempts INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS rate_limit INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS environment TEXT DEFAULT 'production';

-- Migrate configuration data
UPDATE api_service_configurations 
SET 
    api_endpoint = configuration->>'endpoint',
    auth_type = configuration->>'auth_type',
    api_key_header = configuration->>'api_key_header',
    timeout_ms = COALESCE((configuration->>'timeout_ms')::INTEGER, 30000),
    retry_attempts = COALESCE((configuration->>'retry_attempts')::INTEGER, 3),
    rate_limit = COALESCE((configuration->>'rate_limit')::INTEGER, 100),
    environment = COALESCE(configuration->>'environment', 'production')
WHERE configuration IS NOT NULL 
    AND api_endpoint IS NULL;

-- 5. Create indexes on new regular columns for better performance (without CONCURRENTLY)
CREATE INDEX IF NOT EXISTS idx_agent_sessions_agent_name ON agent_sessions(agent_name);
CREATE INDEX IF NOT EXISTS idx_agents_model_provider ON agents(model_provider);
CREATE INDEX IF NOT EXISTS idx_agents_model_name ON agents(model_name);
CREATE INDEX IF NOT EXISTS idx_api_integration_contact_email ON api_integration_registry(contact_email);
CREATE INDEX IF NOT EXISTS idx_api_service_configs_endpoint ON api_service_configurations(api_endpoint);

-- 6. Create composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_agents_provider_model ON agents(model_provider, model_name);
CREATE INDEX IF NOT EXISTS idx_api_registry_auth_approval ON api_integration_registry(requires_authentication, requires_approval);

-- 7. Add constraints for data integrity
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'check_temperature_range') THEN
        ALTER TABLE agents ADD CONSTRAINT check_temperature_range CHECK (temperature IS NULL OR (temperature >= 0 AND temperature <= 2));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'check_max_tokens_positive') THEN
        ALTER TABLE agents ADD CONSTRAINT check_max_tokens_positive CHECK (max_tokens IS NULL OR max_tokens > 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'check_timeout_positive') THEN
        ALTER TABLE agents ADD CONSTRAINT check_timeout_positive CHECK (timeout_seconds IS NULL OR timeout_seconds > 0);
    END IF;
END $$;