-- Fix internal flag for all users with whitelisted domains
UPDATE genie_studio_users 
SET is_internal = true 
WHERE email LIKE '%@geniecellgene.com' 
   OR email LIKE '%@genieaisuite.com' 
   OR email LIKE '%@geniehealth.io';

-- Verify the update
SELECT id, email, is_internal FROM genie_studio_users WHERE email LIKE '%@geniecellgene.com';