-- Fix remaining functions that need SET search_path

-- Find and fix functions that don't have search_path set
-- Let me update the most common ones that are likely causing the warnings

CREATE OR REPLACE FUNCTION public.get_user_effective_permissions(check_user_id uuid, facility_id uuid DEFAULT NULL::uuid)
RETURNS TABLE(permission_name text, source text, expires_at timestamp with time zone)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  -- Direct user permissions
  SELECT 
    p.name,
    'direct'::TEXT as source,
    up.expires_at
  FROM public.user_permissions up
  JOIN public.permissions p ON p.id = up.permission_id
  WHERE up.user_id = check_user_id 
  AND up.is_active = true
  AND (up.expires_at IS NULL OR up.expires_at > NOW())
  
  UNION
  
  -- Role-based permissions
  SELECT DISTINCT
    p.name,
    r.name::TEXT as source,
    NULL::TIMESTAMP WITH TIME ZONE as expires_at
  FROM public.user_roles ur
  JOIN public.roles r ON r.id = ur.role_id
  JOIN public.role_permissions rp ON rp.role_id = r.id
  JOIN public.permissions p ON p.id = rp.permission_id
  LEFT JOIN public.role_permission_overrides rpo ON (
    rpo.role_id = r.id 
    AND rpo.permission_id = p.id 
    AND (rpo.facility_id = facility_id OR rpo.facility_id IS NULL)
  )
  WHERE ur.user_id = check_user_id
  AND (rpo.is_granted IS NULL OR rpo.is_granted = true)
  -- Exclude permissions that are directly granted (to avoid duplicates)
  AND NOT EXISTS (
    SELECT 1 
    FROM public.user_permissions up2
    JOIN public.permissions p2 ON p2.id = up2.permission_id
    WHERE up2.user_id = check_user_id 
    AND p2.name = p.name
    AND up2.is_active = true
    AND (up2.expires_at IS NULL OR up2.expires_at > NOW())
  );
$$;