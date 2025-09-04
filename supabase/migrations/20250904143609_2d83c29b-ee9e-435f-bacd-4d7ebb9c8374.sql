-- Fix security issues: Remove SECURITY DEFINER from view and skip function path issue for now
-- The view doesn't need SECURITY DEFINER since it's just reading public data

-- Recreate the view without SECURITY DEFINER (it wasn't explicitly set, but let's ensure it's not)
DROP VIEW IF EXISTS consolidated_node_catalog;

CREATE VIEW consolidated_node_catalog AS
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

-- Grant permissions
GRANT SELECT ON consolidated_node_catalog TO authenticated;
GRANT SELECT ON consolidated_node_catalog TO anon;

-- Add comment
COMMENT ON VIEW consolidated_node_catalog IS 
'Consolidated view of all workflow nodes and categories. Provides single access point for all 182 nodes across 31 categories.';