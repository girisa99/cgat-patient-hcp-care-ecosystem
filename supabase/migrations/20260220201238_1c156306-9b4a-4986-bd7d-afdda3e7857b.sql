-- Fix EP04 visibility: mark it as public so RLS allows reading
UPDATE video_blueprints 
SET is_public = true 
WHERE id = 'cafcd78a-7957-4021-ba8f-c20daba331b2';

-- Also fix any other blueprints that are invisible due to same issue
-- (not public, not system_default, no created_by)
UPDATE video_blueprints 
SET is_public = true 
WHERE is_public = false 
  AND is_system_default = false 
  AND created_by IS NULL 
  AND is_active = true;