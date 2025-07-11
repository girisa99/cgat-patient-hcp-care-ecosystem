
-- Fix the get_user_effective_modules function structure
DROP FUNCTION IF EXISTS get_user_effective_modules(UUID);

CREATE OR REPLACE FUNCTION get_user_effective_modules(check_user_id UUID)
RETURNS TABLE (
  module_id UUID,
  module_name TEXT,
  module_description TEXT,
  access_source TEXT,
  expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  -- Direct user module assignments
  SELECT 
    m.id::UUID as module_id,
    m.name::TEXT as module_name,
    COALESCE(m.description, '')::TEXT as module_description,
    'direct'::TEXT as access_source,
    uma.expires_at::TIMESTAMPTZ
  FROM user_module_assignments uma
  JOIN modules m ON uma.module_id = m.id
  WHERE uma.user_id = check_user_id 
    AND uma.is_active = true
    AND m.is_active = true
    AND (uma.expires_at IS NULL OR uma.expires_at > NOW())
  
  UNION
  
  -- Role-based module assignments
  SELECT 
    m.id::UUID as module_id,
    m.name::TEXT as module_name,
    COALESCE(m.description, '')::TEXT as module_description,
    'role'::TEXT as access_source,
    NULL::TIMESTAMPTZ as expires_at
  FROM user_roles ur
  JOIN role_module_assignments rma ON ur.role_id = rma.role_id
  JOIN modules m ON rma.module_id = m.id
  WHERE ur.user_id = check_user_id
    AND rma.is_active = true
    AND m.is_active = true;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_user_effective_modules(UUID) TO authenticated;
