-- Final cleanup: Remove old workflow builder tables and dependencies
-- These tables have been fully consolidated into the new structure

-- Drop old tables completely (they should already be empty from previous migrations)
DROP TABLE IF EXISTS public.workflow_builder_categories CASCADE;
DROP TABLE IF EXISTS public.workflow_builder_nodes CASCADE; 
DROP TABLE IF EXISTS public.workflow_node_configs CASCADE;
DROP TABLE IF EXISTS public.node_configurations CASCADE;

-- Also clean up any remaining triggers or functions related to old tables
DROP TRIGGER IF EXISTS update_workflow_builder_updated_at ON public.workflow_builder_categories;
DROP TRIGGER IF EXISTS update_workflow_builder_updated_at ON public.workflow_builder_nodes;

-- Verify consolidation is complete by adding helpful comments to new tables
COMMENT ON TABLE public.workflow_node_categories IS 'Consolidated node categories - replaces workflow_builder_categories';
COMMENT ON TABLE public.workflow_node_types IS 'Consolidated node types with all configuration fields - replaces workflow_builder_nodes, workflow_node_configs, node_configurations';
COMMENT ON TABLE public.workflow_node_instances IS 'Runtime node instances - replaces workflow_node_configs for actual workflow executions';
COMMENT ON VIEW public.consolidated_node_catalog IS 'Complete node catalog view combining categories and types';