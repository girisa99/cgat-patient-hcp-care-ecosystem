-- Final cleanup: Drop old configuration tables after successful consolidation
-- This completes the 4->3 table consolidation

-- Step 1: Verify data migration was successful
DO $$
DECLARE
  old_config_count INTEGER;
  new_config_count INTEGER;
  old_instances_count INTEGER; 
  new_instances_count INTEGER;
BEGIN
  -- Check migration success
  SELECT COUNT(*) INTO old_config_count FROM workflow_node_configs;
  SELECT COUNT(*) INTO new_instances_count FROM workflow_node_instances;
  SELECT COUNT(*) INTO old_instances_count FROM node_configurations;
  
  RAISE NOTICE 'Migration Status - Old configs: %, New instances: %, Old node_configs: %', 
    old_config_count, new_instances_count, old_instances_count;
    
  -- Only proceed if migration looks successful
  IF new_instances_count >= old_config_count THEN
    RAISE NOTICE 'Migration successful, proceeding with cleanup';
  ELSE
    RAISE EXCEPTION 'Migration verification failed - stopping cleanup';
  END IF;
END $$;

-- Step 2: Remove old redundant tables
DROP TABLE IF EXISTS workflow_node_configs CASCADE;
DROP TABLE IF EXISTS node_configurations CASCADE;

-- Step 3: Also remove the original builder tables as requested
DROP TABLE IF EXISTS workflow_builder_categories CASCADE;
DROP TABLE IF EXISTS workflow_builder_nodes CASCADE;

-- Step 4: Create comprehensive view for easy node access
CREATE OR REPLACE VIEW consolidated_node_catalog AS
SELECT 
  wnc.name as category_name,
  wnc.display_name as category_display_name,
  wnc.description as category_description,
  wnc.icon as category_icon,
  wnc.color as category_color,
  wnc.order_index as category_order,
  wnt.id as node_id,
  wnt.type_key,
  wnt.display_name as node_display_name,
  wnt.description as node_description,
  wnt.detailed_explanation,
  wnt.icon as node_icon,
  wnt.color as node_color,
  wnt.default_config,
  wnt.input_schema,
  wnt.output_schema,
  wnt.capabilities,
  wnt.requirements,
  wnt.configuration_schema,
  wnt.ai_model_config,
  wnt.variables_config,
  wnt.apis_config,
  wnt.connectors_config,
  wnt.data_storage_config,
  wnt.validation_rules,
  wnt.business_rules,
  wnt.order_index as node_order,
  wnt.is_active
FROM workflow_node_types wnt
JOIN workflow_node_categories wnc ON wnt.category_id = wnc.id
WHERE wnt.is_active = true AND wnc.is_active = true
ORDER BY wnc.order_index, wnt.order_index;

-- Step 5: Grant appropriate permissions on the view
GRANT SELECT ON consolidated_node_catalog TO authenticated;
GRANT SELECT ON consolidated_node_catalog TO anon;

-- Add comment explaining the consolidation
COMMENT ON VIEW consolidated_node_catalog IS 
'Consolidated view of all workflow nodes and categories after 4->3 table consolidation. 
Provides single access point for all node configuration data across 182 nodes and 31 categories.';

RAISE NOTICE 'Consolidation Complete: 4 tables -> 3 tables with unified configuration structure';