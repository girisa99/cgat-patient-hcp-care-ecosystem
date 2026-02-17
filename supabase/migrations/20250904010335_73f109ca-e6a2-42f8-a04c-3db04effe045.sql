-- PHASE 3: Cleanup - Disable old tables (mark as inactive instead of dropping for safety)
-- This preserves data while making the consolidated system the active one

DO $$
DECLARE
    final_categories INTEGER;
    final_nodes INTEGER;
BEGIN
    -- Mark old workflow_builder_categories as inactive instead of dropping
    UPDATE workflow_builder_categories SET is_active = false;
    
    -- Mark old workflow_builder_nodes as inactive instead of dropping  
    UPDATE workflow_builder_nodes SET is_active = false;
    
    -- Get final counts
    SELECT COUNT(*) INTO final_categories FROM workflow_node_categories WHERE is_active = true;
    SELECT COUNT(*) INTO final_nodes FROM workflow_node_types WHERE is_active = true;
    
    RAISE NOTICE '✅ CONSOLIDATION COMPLETE!';
    RAISE NOTICE 'Final consolidated system:';
    RAISE NOTICE '  - Categories: %', final_categories;
    RAISE NOTICE '  - Nodes: %', final_nodes;
    RAISE NOTICE '  - Old tables marked inactive (preserved for safety)';
    RAISE NOTICE '  - AI Assistant now uses unified workflow_node_* tables';
END $$;