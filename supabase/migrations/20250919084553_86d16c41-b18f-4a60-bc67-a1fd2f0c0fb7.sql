-- Add enrollment_type field to support MCP, Conversational, AI structure, online enrollment types
ALTER TABLE profiles ADD COLUMN enrollment_type TEXT DEFAULT 'not_selected';

-- Add enrollment_type to treatment_center_onboarding as well for comprehensive tracking
ALTER TABLE treatment_center_onboarding ADD COLUMN enrollment_type TEXT DEFAULT 'not_selected';

-- Create enum for enrollment types to ensure consistency
CREATE TYPE enrollment_type_enum AS ENUM ('not_selected', 'mcp', 'conversational', 'ai_structure', 'online');

-- Update the columns to use the enum (optional, keeping as text for flexibility)
COMMENT ON COLUMN profiles.enrollment_type IS 'Type of enrollment: not_selected, mcp, conversational, ai_structure, online';
COMMENT ON COLUMN treatment_center_onboarding.enrollment_type IS 'Type of enrollment: not_selected, mcp, conversational, ai_structure, online';