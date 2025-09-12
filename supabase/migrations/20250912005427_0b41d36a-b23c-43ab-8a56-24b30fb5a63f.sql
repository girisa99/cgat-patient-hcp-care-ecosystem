-- Fix security issues identified by the linter

-- Set proper search_path for functions that don't have it
ALTER FUNCTION public.has_role(uuid, user_role) SET search_path = public;
ALTER FUNCTION public.get_user_roles(uuid) SET search_path = public;
ALTER FUNCTION public.has_permission(uuid, text) SET search_path = public;

-- Add search_path to any other functions that need it
ALTER FUNCTION public.get_user_effective_permissions(uuid, uuid) SET search_path = public;

-- Log the security improvements
INSERT INTO audit_logs (user_id, action, table_name, additional_context)
VALUES (
  COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
  'security_hardening',
  'database_functions',
  jsonb_build_object(
    'improvement_type', 'search_path_security',
    'functions_updated', 4,
    'timestamp', now()
  )
);