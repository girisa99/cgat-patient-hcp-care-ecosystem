-- Migration: Convert JSONB to Regular Columns for Better Performance
-- This migration extracts commonly used JSONB fields into regular columns
-- for improved performance, indexing, and API integration

-- 1. Agent Sessions Table - Extract basic_info fields
ALTER TABLE agent_sessions 
ADD COLUMN agent_name TEXT,
ADD COLUMN agent_description TEXT,
ADD COLUMN agent_purpose TEXT,
ADD COLUMN agent_brand TEXT,
ADD COLUMN agent_use_case TEXT;

-- Migrate existing data from basic_info JSONB to regular columns
UPDATE agent_sessions 
SET 
    agent_name = basic_info->>'name',
    agent_description = basic_info->>'description',
    agent_purpose = basic_info->>'purpose',
    agent_brand = basic_info->>'brand',
    agent_use_case = basic_info->>'use_case'
WHERE basic_info IS NOT NULL;

-- 2. Agents Table - Extract configuration fields  
ALTER TABLE agents
ADD COLUMN model_provider TEXT,
ADD COLUMN model_name TEXT,
ADD COLUMN temperature DECIMAL(3,2),
ADD COLUMN max_tokens INTEGER,
ADD COLUMN system_prompt TEXT,
ADD COLUMN enabled_features TEXT[],
ADD COLUMN api_rate_limit INTEGER DEFAULT 100,
ADD COLUMN timeout_seconds INTEGER DEFAULT 30;

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
WHERE configuration IS NOT NULL;

-- 3. API Integration Registry - Extract structured fields
ALTER TABLE api_integration_registry
ADD COLUMN contact_email TEXT,
ADD COLUMN contact_phone TEXT,
ADD COLUMN contact_name TEXT,
ADD COLUMN rate_limit_requests_per_hour INTEGER DEFAULT 1000,
ADD COLUMN rate_limit_requests_per_minute INTEGER DEFAULT 100,
ADD COLUMN requires_approval BOOLEAN DEFAULT true,
ADD COLUMN requires_authentication BOOLEAN DEFAULT true,
ADD COLUMN webhook_url TEXT,
ADD COLUMN webhook_secret TEXT,
ADD COLUMN sla_response_time_ms INTEGER,
ADD COLUMN sla_uptime_percentage DECIMAL(5,2);

-- Migrate contact_info data
UPDATE api_integration_registry 
SET 
    contact_email = contact_info->>'email',
    contact_phone = contact_info->>'phone',
    contact_name = contact_info->>'name'
WHERE contact_info IS NOT NULL;

-- Migrate rate_limits data
UPDATE api_integration_registry 
SET 
    rate_limit_requests_per_hour = COALESCE((rate_limits->>'requests_per_hour')::INTEGER, 1000),
    rate_limit_requests_per_minute = COALESCE((rate_limits->>'requests_per_minute')::INTEGER, 100)
WHERE rate_limits IS NOT NULL;

-- Migrate security_requirements data
UPDATE api_integration_registry 
SET 
    requires_approval = COALESCE((security_requirements->>'require_approval')::BOOLEAN, true),
    requires_authentication = COALESCE((security_requirements->>'require_authentication')::BOOLEAN, true)
WHERE security_requirements IS NOT NULL;

-- Migrate webhook_config data
UPDATE api_integration_registry 
SET 
    webhook_url = webhook_config->>'url',
    webhook_secret = webhook_config->>'secret'
WHERE webhook_config IS NOT NULL;

-- Migrate sla_requirements data
UPDATE api_integration_registry 
SET 
    sla_response_time_ms = (sla_requirements->>'response_time_ms')::INTEGER,
    sla_uptime_percentage = (sla_requirements->>'uptime_percentage')::DECIMAL(5,2)
WHERE sla_requirements IS NOT NULL;

-- 4. API Service Configurations - Extract configuration fields
ALTER TABLE api_service_configurations
ADD COLUMN api_endpoint TEXT,
ADD COLUMN auth_type TEXT,
ADD COLUMN api_key_header TEXT,
ADD COLUMN timeout_ms INTEGER DEFAULT 30000,
ADD COLUMN retry_attempts INTEGER DEFAULT 3,
ADD COLUMN rate_limit INTEGER DEFAULT 100,
ADD COLUMN environment TEXT DEFAULT 'production';

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
WHERE configuration IS NOT NULL;

-- 5. Comprehensive Test Cases - Extract metadata fields
ALTER TABLE comprehensive_test_cases
ADD COLUMN test_priority TEXT,
ADD COLUMN estimated_duration_minutes INTEGER,
ADD COLUMN compliance_level TEXT,
ADD COLUMN requires_approval BOOLEAN DEFAULT false,
ADD COLUMN test_environment TEXT,
ADD COLUMN automation_level TEXT;

-- Migrate execution_data
UPDATE comprehensive_test_cases 
SET 
    test_priority = execution_data->>'priority',
    estimated_duration_minutes = (execution_data->>'estimated_duration_minutes')::INTEGER,
    test_environment = execution_data->>'environment',
    automation_level = execution_data->>'automation_level'
WHERE execution_data IS NOT NULL;

-- Migrate cfr_part11_metadata
UPDATE comprehensive_test_cases 
SET 
    compliance_level = cfr_part11_metadata->>'compliance_level',
    requires_approval = COALESCE((cfr_part11_metadata->>'requires_approval')::BOOLEAN, false)
WHERE cfr_part11_metadata IS NOT NULL;

-- 6. Create indexes on new regular columns for better performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_sessions_agent_name ON agent_sessions(agent_name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agents_model_provider ON agents(model_provider);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agents_model_name ON agents(model_name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_integration_contact_email ON api_integration_registry(contact_email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_service_configs_endpoint ON api_service_configurations(api_endpoint);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_test_cases_priority ON comprehensive_test_cases(test_priority);

-- 7. Create composite indexes for common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agents_provider_model ON agents(model_provider, model_name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_registry_auth_approval ON api_integration_registry(requires_authentication, requires_approval);

-- 8. Add constraints for data integrity
ALTER TABLE agents 
ADD CONSTRAINT check_temperature_range CHECK (temperature IS NULL OR (temperature >= 0 AND temperature <= 2)),
ADD CONSTRAINT check_max_tokens_positive CHECK (max_tokens IS NULL OR max_tokens > 0),
ADD CONSTRAINT check_timeout_positive CHECK (timeout_seconds IS NULL OR timeout_seconds > 0);

ALTER TABLE api_integration_registry
ADD CONSTRAINT check_rate_limit_positive CHECK (rate_limit_requests_per_hour > 0 AND rate_limit_requests_per_minute > 0),
ADD CONSTRAINT check_sla_uptime_range CHECK (sla_uptime_percentage IS NULL OR (sla_uptime_percentage >= 0 AND sla_uptime_percentage <= 100));

ALTER TABLE api_service_configurations
ADD CONSTRAINT check_timeout_ms_positive CHECK (timeout_ms > 0),
ADD CONSTRAINT check_retry_attempts_valid CHECK (retry_attempts >= 0 AND retry_attempts <= 10);

-- 9. Update triggers to maintain data consistency
CREATE OR REPLACE FUNCTION sync_agent_basic_info()
RETURNS TRIGGER AS $$
BEGIN
  -- When regular columns are updated, sync back to basic_info JSONB for backwards compatibility
  IF TG_OP = 'UPDATE' THEN
    NEW.basic_info = COALESCE(NEW.basic_info, '{}'::jsonb) || jsonb_build_object(
      'name', NEW.agent_name,
      'description', NEW.agent_description,
      'purpose', NEW.agent_purpose,
      'brand', NEW.agent_brand,
      'use_case', NEW.agent_use_case
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_agent_sessions_basic_info
  BEFORE UPDATE ON agent_sessions
  FOR EACH ROW
  EXECUTE FUNCTION sync_agent_basic_info();

-- 10. Performance optimization function
CREATE OR REPLACE FUNCTION optimize_jsonb_migration()
RETURNS TEXT AS $$
BEGIN
  -- Vacuum and analyze tables after migration
  VACUUM ANALYZE agent_sessions;
  VACUUM ANALYZE agents;
  VACUUM ANALYZE api_integration_registry;
  VACUUM ANALYZE api_service_configurations;
  VACUUM ANALYZE comprehensive_test_cases;
  
  RETURN 'JSONB to regular columns migration completed and optimized';
END;
$$ LANGUAGE plpgsql;

-- Execute optimization
SELECT optimize_jsonb_migration();