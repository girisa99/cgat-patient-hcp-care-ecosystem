-- PHASE 2: Migrate workflow_builder_nodes to workflow_node_types
-- Map all 95 nodes to the new schema with proper relationships

DO $$
DECLARE
    node_mapping RECORD;
    target_category_id UUID;
    new_node_id UUID;
    nodes_migrated INTEGER := 0;
BEGIN
    -- Migrate all nodes from workflow_builder_nodes to workflow_node_types
    FOR node_mapping IN 
        SELECT bn.id as old_id, bn.type, bn.category, bn.label, bn.description, bn.configuration
        FROM workflow_builder_nodes bn
        WHERE bn.is_active = true
        ORDER BY bn.category, bn.label
    LOOP
        -- Find the corresponding category_id in workflow_node_categories
        SELECT id INTO target_category_id 
        FROM workflow_node_categories 
        WHERE name = node_mapping.category AND is_active = true;
        
        -- If category not found, log and skip (shouldn't happen after phase 1)
        IF target_category_id IS NULL THEN
            RAISE WARNING 'Category % not found for node %', node_mapping.category, node_mapping.label;
            CONTINUE;
        END IF;
        
        new_node_id := gen_random_uuid();
        
        -- Insert the node into workflow_node_types
        INSERT INTO workflow_node_types (
            id, category_id, type_key, display_name, description,
            detailed_explanation, icon, color, is_draggable, is_configurable,
            default_config, input_schema, output_schema, capabilities,
            requirements, order_index, is_active, created_by,
            created_at, updated_at
        ) VALUES (
            new_node_id,
            target_category_id,
            LOWER(REPLACE(REPLACE(node_mapping.label, ' ', '_'), '/', '_')), -- Generate type_key
            node_mapping.label,
            COALESCE(node_mapping.description, ''),
            COALESCE(node_mapping.description, ''), -- Use description as detailed explanation
            CASE 
                WHEN node_mapping.category = 'triggers' THEN 'Zap'
                WHEN node_mapping.category = 'actions' THEN 'Play'
                WHEN node_mapping.category = 'conditions' THEN 'GitBranch'
                WHEN node_mapping.category = 'data' THEN 'Database'
                WHEN node_mapping.category = 'business_tools' THEN 'Building'
                WHEN node_mapping.category = 'healthcare_systems' THEN 'Activity'
                WHEN node_mapping.category = 'communication' THEN 'MessageSquare'
                WHEN node_mapping.category = 'data_analytics' THEN 'BarChart'
                WHEN node_mapping.category = 'automation' THEN 'Zap'
                WHEN node_mapping.category = 'security' THEN 'Shield'
                WHEN node_mapping.category = 'finance' THEN 'DollarSign'
                WHEN node_mapping.category = 'hr_management' THEN 'Users'
                WHEN node_mapping.category = 'document_management' THEN 'FileText'
                WHEN node_mapping.category = 'e_commerce' THEN 'ShoppingCart'
                WHEN node_mapping.category = 'project_management' THEN 'CheckSquare'
                WHEN node_mapping.category = 'crm_systems' THEN 'Contact'
                WHEN node_mapping.category = 'development_tools' THEN 'Code'
                ELSE 'Box'
            END,
            CASE 
                WHEN node_mapping.category = 'triggers' THEN '#EF4444'
                WHEN node_mapping.category = 'actions' THEN '#10B981'
                WHEN node_mapping.category = 'conditions' THEN '#3B82F6'
                WHEN node_mapping.category = 'data' THEN '#8B5CF6'
                WHEN node_mapping.category = 'business_tools' THEN '#F59E0B'
                WHEN node_mapping.category = 'healthcare_systems' THEN '#DC2626'
                WHEN node_mapping.category = 'communication' THEN '#06B6D4'
                WHEN node_mapping.category = 'data_analytics' THEN '#8B5CF6'
                WHEN node_mapping.category = 'automation' THEN '#F59E0B'
                WHEN node_mapping.category = 'security' THEN '#EF4444'
                WHEN node_mapping.category = 'finance' THEN '#059669'
                WHEN node_mapping.category = 'hr_management' THEN '#7C3AED'
                WHEN node_mapping.category = 'document_management' THEN '#0891B2'
                WHEN node_mapping.category = 'e_commerce' THEN '#DC2626'
                WHEN node_mapping.category = 'project_management' THEN '#16A34A'
                WHEN node_mapping.category = 'crm_systems' THEN '#2563EB'
                WHEN node_mapping.category = 'development_tools' THEN '#1F2937'
                ELSE '#6B7280'
            END,
            true, -- is_draggable
            true, -- is_configurable
            COALESCE(node_mapping.configuration, '{}'::jsonb), -- default_config
            '{}'::jsonb, -- input_schema
            '{}'::jsonb, -- output_schema
            '[]'::jsonb, -- capabilities
            '{}'::jsonb, -- requirements
            nodes_migrated, -- order_index
            true, -- is_active
            NULL, -- created_by
            now(),
            now()
        );
        
        nodes_migrated := nodes_migrated + 1;
        
        IF nodes_migrated % 10 = 0 THEN
            RAISE NOTICE 'Migrated % nodes so far...', nodes_migrated;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Node migration completed. Migrated % nodes total.', nodes_migrated;
    RAISE NOTICE 'Total workflow_node_types now: %', (SELECT COUNT(*) FROM workflow_node_types WHERE is_active = true);
END $$;