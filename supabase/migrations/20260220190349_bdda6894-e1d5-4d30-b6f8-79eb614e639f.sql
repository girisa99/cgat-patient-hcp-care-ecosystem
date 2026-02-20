-- Patch EP04 project with correct category (Technology) and format (Video) IDs
UPDATE cast_projects 
SET 
  category_id = '5f250db9-a0d3-461c-9420-e610ef254c38',
  format_id = 'ca2e316e-d4a3-4a38-8c82-09cb08490a3c',
  content_type = 'video',
  intent_value = 'video'
WHERE id = '442d1afb-de33-46f4-9ec3-2e0e64e91aa2';