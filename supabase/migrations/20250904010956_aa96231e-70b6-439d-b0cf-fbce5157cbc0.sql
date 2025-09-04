-- PHASE 4: Clean up duplicates and reorganize categories into logical agent lifecycle flow
-- 1. Remove duplicate nodes first
-- 2. Reorganize categories into logical agent lifecycle sequence

DO $$
DECLARE
    duplicate_rec RECORD;
    category_rec RECORD;
    new_order INTEGER := 0;
BEGIN
    -- STEP 1: Clean up duplicates
    RAISE NOTICE 'Cleaning up duplicate nodes...';
    
    -- Remove duplicate Docker Container (keep original from Code & Deployment)
    DELETE FROM workflow_node_types 
    WHERE type_key = 'development_tools_docker_container' AND is_active = true;
    
    -- Remove duplicate NPI Validator (keep original from healthcare_systems)
    DELETE FROM workflow_node_types 
    WHERE type_key = 'npi_validator' AND category_id = (
        SELECT id FROM workflow_node_categories WHERE name = 'business-tools'
    );
    
    RAISE NOTICE 'Removed 2 duplicate nodes';
    
    -- STEP 2: Reorganize categories into logical agent lifecycle sequence
    RAISE NOTICE 'Reorganizing categories into agent lifecycle flow...';
    
    -- PHASE 1: DESIGN & PLANNING (order 1-4)
    UPDATE workflow_node_categories SET order_index = 1 
    WHERE name = 'Agent Flows' AND is_active = true;
    
    UPDATE workflow_node_categories SET order_index = 2 
    WHERE name = 'triggers' AND is_active = true;
    
    UPDATE workflow_node_categories SET order_index = 3 
    WHERE name = 'conditions' AND is_active = true;
    
    UPDATE workflow_node_categories SET order_index = 4 
    WHERE name = 'actions' AND is_active = true;
    
    -- PHASE 2: KNOWLEDGE & CONTEXT (order 5-8)
    UPDATE workflow_node_categories SET order_index = 5 
    WHERE name = 'Document Loaders' AND is_active = true;
    
    UPDATE workflow_node_categories SET order_index = 6 
    WHERE name = 'Vector Stores' AND is_active = true;
    
    UPDATE workflow_node_categories SET order_index = 7 
    WHERE name = 'Cache & Memory' AND is_active = true;
    
    UPDATE workflow_node_categories SET order_index = 8 
    WHERE name = 'data' AND is_active = true;
    
    -- PHASE 3: AI & INTELLIGENCE (order 9-11)
    UPDATE workflow_node_categories SET order_index = 9 
    WHERE name = 'GenAI & LLM' AND is_active = true;
    
    UPDATE workflow_node_categories SET order_index = 10 
    WHERE name = 'Voice Configuration' AND is_active = true;
    
    UPDATE workflow_node_categories SET order_index = 11 
    WHERE name = 'Human Loop' AND is_active = true;
    
    -- PHASE 4: BUSINESS INTEGRATIONS (order 12-20)
    UPDATE workflow_node_categories SET order_index = 12 
    WHERE name = 'business_tools' AND is_active = true;
    
    UPDATE workflow_node_categories SET order_index = 13 
    WHERE name = 'healthcare_systems' AND is_active = true;
    
    UPDATE workflow_node_categories SET order_index = 14 
    WHERE name = 'crm_systems' AND is_active = true;
    
    UPDATE workflow_node_categories SET order_index = 15 
    WHERE name = 'finance' AND is_active = true;
    
    UPDATE workflow_node_categories SET order_index = 16 
    WHERE name = 'hr_management' AND is_active = true;
    
    UPDATE workflow_node_categories SET order_index = 17 
    WHERE name = 'project_management' AND is_active = true;
    
    UPDATE workflow_node_categories SET order_index = 18 
    WHERE name = 'communication' AND is_active = true;
    
    UPDATE workflow_node_categories SET order_index = 19 
    WHERE name = 'social_media' AND is_active = true;
    
    UPDATE workflow_node_categories SET order_index = 20 
    WHERE name = 'e_commerce' AND is_active = true;
    
    -- PHASE 5: DEVELOPMENT & AUTOMATION (order 21-26)
    UPDATE workflow_node_categories SET order_index = 21 
    WHERE name = 'automation' AND is_active = true;
    
    UPDATE workflow_node_categories SET order_index = 22 
    WHERE name = 'MCP Protocol' AND is_active = true;
    
    UPDATE workflow_node_categories SET order_index = 23 
    WHERE name = 'Tools & Utilities' AND is_active = true;
    
    UPDATE workflow_node_categories SET order_index = 24 
    WHERE name = 'development_tools' AND is_active = true;
    
    UPDATE workflow_node_categories SET order_index = 25 
    WHERE name = 'Code & Deployment' AND is_active = true;
    
    UPDATE workflow_node_categories SET order_index = 26 
    WHERE name = 'security' AND is_active = true;
    
    -- PHASE 6: DEPLOYMENT & MONITORING (order 27-31)
    UPDATE workflow_node_categories SET order_index = 27 
    WHERE name = 'Channel Deployment' AND is_active = true;
    
    UPDATE workflow_node_categories SET order_index = 28 
    WHERE name = 'data_analytics' AND is_active = true;
    
    UPDATE workflow_node_categories SET order_index = 29 
    WHERE name = 'document_management' AND is_active = true;
    
    -- Handle any remaining categories
    UPDATE workflow_node_categories SET order_index = 30 
    WHERE name = 'business-tools' AND is_active = true;
    
    -- Final count and summary
    RAISE NOTICE 'Category reorganization complete!';
    RAISE NOTICE 'Agent Lifecycle Flow: Design → Knowledge → AI → Business → Development → Deployment';
    RAISE NOTICE 'Total active categories: %', (SELECT COUNT(*) FROM workflow_node_categories WHERE is_active = true);
    RAISE NOTICE 'Total active nodes: %', (SELECT COUNT(*) FROM workflow_node_types WHERE is_active = true);
END $$;