-- Consolidate node configuration tables
-- Step 1: Enhance workflow_node_types with all configuration fields

-- Add comprehensive configuration columns to workflow_node_types
ALTER TABLE workflow_node_types 
ADD COLUMN IF NOT EXISTS configuration_schema JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS ai_model_config JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS variables_config JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS apis_config JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS connectors_config JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS data_storage_config JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS validation_rules JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS business_rules JSONB DEFAULT '{}'::jsonb;

-- Step 2: Create unified workflow_node_instances table
CREATE TABLE IF NOT EXISTS workflow_node_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL,
  node_id TEXT NOT NULL,
  node_type_key TEXT NOT NULL REFERENCES workflow_node_types(type_key),
  instance_name TEXT,
  configuration JSONB DEFAULT '{}'::jsonb,
  position JSONB DEFAULT '{"x": 0, "y": 0}'::jsonb,
  size JSONB DEFAULT '{"width": 200, "height": 100}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID,
  
  UNIQUE(workflow_id, node_id)
);

-- Enable RLS on new table
ALTER TABLE workflow_node_instances ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for workflow_node_instances
CREATE POLICY "Users can manage their workflow node instances"
ON workflow_node_instances
FOR ALL 
USING (
  created_by = auth.uid() OR 
  is_admin_user_safe(auth.uid())
);

CREATE POLICY "Users can view workflow node instances"
ON workflow_node_instances
FOR SELECT
USING (
  created_by = auth.uid() OR 
  is_admin_user_safe(auth.uid()) OR
  is_active = true
);

-- Step 3: Migrate data from old tables to new structure
-- Migrate workflow_node_configs data to workflow_node_instances
INSERT INTO workflow_node_instances (
  workflow_id, node_id, node_type_key, configuration, 
  position, size, metadata, created_at, updated_at
)
SELECT 
  workflow_instance_id,
  node_id,
  node_type_key,
  configuration,
  position,
  size,
  metadata,
  created_at,
  updated_at
FROM workflow_node_configs
ON CONFLICT (workflow_id, node_id) DO NOTHING;

-- Migrate node_configurations data into workflow_node_types configuration_schema
UPDATE workflow_node_types 
SET 
  configuration_schema = COALESCE(configuration_schema, '{}'::jsonb) || 
    jsonb_build_object(
      'variables', nc.variables,
      'apis', nc.apis,
      'data_storage', nc.data_storage,
      'connectors', nc.connectors,
      'ai_model_config', nc.ai_model_config
    ),
  ai_model_config = COALESCE(nc.ai_model_config, '{}'::jsonb),
  variables_config = COALESCE(nc.variables, '[]'::jsonb),
  apis_config = COALESCE(nc.apis, '[]'::jsonb),
  connectors_config = COALESCE(nc.connectors, '[]'::jsonb),
  data_storage_config = COALESCE(nc.data_storage, '{}'::jsonb)
FROM (
  SELECT DISTINCT ON (configuration_type) *
  FROM node_configurations
) nc
WHERE workflow_node_types.type_key = nc.configuration_type;

-- Step 4: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_workflow_node_instances_workflow_id 
ON workflow_node_instances(workflow_id);

CREATE INDEX IF NOT EXISTS idx_workflow_node_instances_node_type_key 
ON workflow_node_instances(node_type_key);

CREATE INDEX IF NOT EXISTS idx_workflow_node_instances_created_by 
ON workflow_node_instances(created_by);

-- Add updated_at trigger
CREATE TRIGGER update_workflow_node_instances_updated_at
  BEFORE UPDATE ON workflow_node_instances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();