-- PHASE 1: Migrate workflow_builder_categories to workflow_node_categories
-- Handle the one existing overlap (social_media) and add all unique categories

-- First, let's see what we're working with and create a mapping
DO $$
DECLARE
    category_mapping RECORD;
    new_category_id UUID;
    max_order INTEGER;
BEGIN
    -- Get current max order_index from workflow_node_categories
    SELECT COALESCE(MAX(order_index), 0) INTO max_order FROM workflow_node_categories;
    
    -- Migrate categories that don't exist in workflow_node_categories
    FOR category_mapping IN 
        SELECT bc.id as old_id, bc.name, bc.description, bc.color, bc.icon, bc.sort_order
        FROM workflow_builder_categories bc
        WHERE bc.is_active = true 
        AND bc.name NOT IN (SELECT name FROM workflow_node_categories WHERE is_active = true)
        ORDER BY bc.sort_order
    LOOP
        max_order := max_order + 1;
        new_category_id := gen_random_uuid();
        
        -- Insert the category into workflow_node_categories
        INSERT INTO workflow_node_categories (
            id, name, display_name, description, icon, color,
            parent_category_id, order_index, is_active,
            created_at, updated_at
        ) VALUES (
            new_category_id,
            category_mapping.name,
            CASE 
                WHEN category_mapping.name = 'triggers' THEN 'Triggers'
                WHEN category_mapping.name = 'actions' THEN 'Actions'
                WHEN category_mapping.name = 'conditions' THEN 'Conditions'
                WHEN category_mapping.name = 'data' THEN 'Data Processing'
                WHEN category_mapping.name = 'business_tools' THEN 'Business Tools'
                WHEN category_mapping.name = 'healthcare_systems' THEN 'Healthcare Systems'
                WHEN category_mapping.name = 'communication' THEN 'Communication'
                WHEN category_mapping.name = 'data_analytics' THEN 'Data Analytics'
                WHEN category_mapping.name = 'automation' THEN 'Automation'
                WHEN category_mapping.name = 'security' THEN 'Security'
                WHEN category_mapping.name = 'finance' THEN 'Finance'
                WHEN category_mapping.name = 'hr_management' THEN 'HR Management'
                WHEN category_mapping.name = 'document_management' THEN 'Document Management'
                WHEN category_mapping.name = 'e_commerce' THEN 'E-Commerce'
                WHEN category_mapping.name = 'project_management' THEN 'Project Management'
                WHEN category_mapping.name = 'crm_systems' THEN 'CRM Systems'
                WHEN category_mapping.name = 'development_tools' THEN 'Development Tools'
                ELSE INITCAP(REPLACE(category_mapping.name, '_', ' '))
            END,
            category_mapping.description,
            category_mapping.icon,
            category_mapping.color,
            NULL, -- parent_category_id
            max_order,
            true,
            now(),
            now()
        );
        
        RAISE NOTICE 'Migrated category: % (%) -> %', category_mapping.name, category_mapping.old_id, new_category_id;
    END LOOP;
    
    RAISE NOTICE 'Category migration completed. Total categories now: %', (SELECT COUNT(*) FROM workflow_node_categories WHERE is_active = true);
END $$;