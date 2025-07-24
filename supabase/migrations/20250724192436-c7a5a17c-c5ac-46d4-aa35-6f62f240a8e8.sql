-- Fix only the admin functions that we know exist
ALTER FUNCTION public.is_admin_user(uuid) SET search_path TO 'public';
ALTER FUNCTION public.is_admin_user_safe(uuid) SET search_path TO 'public';