-- Merge business-tools nodes into business_tools category
UPDATE workflow_node_types 
SET category_id = (SELECT id FROM workflow_node_categories WHERE name = 'business_tools')
WHERE category_id = (SELECT id FROM workflow_node_categories WHERE name = 'business-tools');

-- Delete the duplicate business-tools category
DELETE FROM workflow_node_categories WHERE name = 'business-tools';

-- Merge healthcare_systems into Healthcare & Compliance (keep Healthcare & Compliance as primary)
UPDATE workflow_node_types 
SET category_id = (SELECT id FROM workflow_node_categories WHERE name = 'Healthcare & Compliance')
WHERE category_id = (SELECT id FROM workflow_node_categories WHERE name = 'healthcare_systems');

DELETE FROM workflow_node_categories WHERE name = 'healthcare_systems';

-- Merge document_management into Document Loaders
UPDATE workflow_node_types 
SET category_id = (SELECT id FROM workflow_node_categories WHERE name = 'Document Loaders')
WHERE category_id = (SELECT id FROM workflow_node_categories WHERE name = 'document_management');

DELETE FROM workflow_node_categories WHERE name = 'document_management';

-- Merge data_analytics into data
UPDATE workflow_node_types 
SET category_id = (SELECT id FROM workflow_node_categories WHERE name = 'data')
WHERE category_id = (SELECT id FROM workflow_node_categories WHERE name = 'data_analytics');

DELETE FROM workflow_node_categories WHERE name = 'data_analytics';

-- Merge development_tools into Code & Deployment
UPDATE workflow_node_types 
SET category_id = (SELECT id FROM workflow_node_categories WHERE name = 'Code & Deployment')
WHERE category_id = (SELECT id FROM workflow_node_categories WHERE name = 'development_tools');

DELETE FROM workflow_node_categories WHERE name = 'development_tools';