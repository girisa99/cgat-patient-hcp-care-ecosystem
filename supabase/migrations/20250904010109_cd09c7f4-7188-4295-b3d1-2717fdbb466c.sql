-- PHASE 2: Migrate workflow_builder_nodes to workflow_node_types
-- Map nodes to their appropriate categories and transform schema

DO $$
DECLARE
    node_mapping RECORD;
    target_category_id UUID;
    new_node_id UUID;
    node_counter INTEGER := 0;
BEGIN
    -- Migrate all nodes from workflow_builder_nodes
    FOR node_mapping IN 
        SELECT bn.id as old_id, bn.type, bn.category, bn.label, bn.description, bn.configuration
        FROM workflow_builder_nodes bn
        WHERE bn.is_active = true
        ORDER BY bn.category, bn.label
    LOOP
        -- Get the target category ID from workflow_node_categories
        SELECT id INTO target_category_id 
        FROM workflow_node_categories 
        WHERE name = node_mapping.category AND is_active = true;
        
        -- If category not found, log and skip
        IF target_category_id IS NULL THEN
            RAISE WARNING 'Category not found for node: % (category: %)', node_mapping.label, node_mapping.category;
            CONTINUE;
        END IF;
        
        new_node_id := gen_random_uuid();
        node_counter := node_counter + 1;
        
        -- Insert the node into workflow_node_types
        INSERT INTO workflow_node_types (
            id, category_id, type_key, display_name, description, detailed_explanation,
            icon, color, is_draggable, is_configurable, default_config,
            input_schema, output_schema, capabilities, requirements,
            order_index, is_active, created_by, created_at, updated_at
        ) VALUES (
            new_node_id,
            target_category_id,
            LOWER(REPLACE(REPLACE(node_mapping.label, ' ', '_'), '/', '_')), -- type_key
            node_mapping.label, -- display_name
            COALESCE(node_mapping.description, node_mapping.label),
            COALESCE(node_mapping.description, 'Migrated from workflow builder: ' || node_mapping.label),
            -- Set appropriate icons based on category
            CASE node_mapping.category
                WHEN 'triggers' THEN 'Zap'
                WHEN 'actions' THEN 'Play'
                WHEN 'conditions' THEN 'GitBranch'
                WHEN 'data' THEN 'Database'
                WHEN 'business_tools' THEN 'Building'
                WHEN 'healthcare_systems' THEN 'Activity'
                WHEN 'communication' THEN 'MessageSquare'
                WHEN 'data_analytics' THEN 'BarChart'
                WHEN 'automation' THEN 'Zap'
                WHEN 'security' THEN 'Shield'
                WHEN 'finance' THEN 'DollarSign'
                WHEN 'hr_management' THEN 'Users'
                WHEN 'document_management' THEN 'FileText'
                WHEN 'social_media' THEN 'Share2'
                WHEN 'e_commerce' THEN 'ShoppingCart'
                WHEN 'project_management' THEN 'CheckSquare'
                WHEN 'crm_systems' THEN 'Contact'
                WHEN 'development_tools' THEN 'Code'
                ELSE 'Box'
            END,
            -- Set colors based on category  
            CASE node_mapping.category
                WHEN 'triggers' THEN '#EF4444'
                WHEN 'actions' THEN '#10B981'
                WHEN 'conditions' THEN '#3B82F6'
                WHEN 'data' THEN '#8B5CF6'
                WHEN 'business_tools' THEN '#F59E0B'
                WHEN 'healthcare_systems' THEN '#DC2626'
                WHEN 'communication' THEN '#06B6D4'
                WHEN 'data_analytics' THEN '#8B5CF6'
                WHEN 'automation' THEN '#F59E0B'
                WHEN 'security' THEN '#EF4444'
                WHEN 'finance' THEN '#059669'
                WHEN 'hr_management' THEN '#7C3AED'
                WHEN 'document_management' THEN '#0891B2'
                WHEN 'social_media' THEN '#DB2777'
                WHEN 'e_commerce' THEN '#DC2626'
                WHEN 'project_management' THEN '#16A34A'
                WHEN 'crm_systems' THEN '#2563EB'
                WHEN 'development_tools' THEN '#1F2937'
                ELSE '#6B7280'
            END,
            true, -- is_draggable
            true, -- is_configurable
            COALESCE(node_mapping.configuration, '{}'), -- default_config
            '{}', -- input_schema (empty for now)
            '{}', -- output_schema (empty for now)
            ARRAY[node_mapping.category], -- capabilities
            '{}', -- requirements (empty for now)
            node_counter, -- order_index
            true, -- is_active
            NULL, -- created_by (system migration)
            now(),
            now()
        );
        
        IF node_counter % 10 = 0 THEN
            RAISE NOTICE 'Migrated % nodes...', node_counter;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Node migration completed. Migrated % nodes total.', node_counter;
    RAISE NOTICE 'Total workflow_node_types now: %', (SELECT COUNT(*) FROM workflow_node_types WHERE is_active = true);
END $$;