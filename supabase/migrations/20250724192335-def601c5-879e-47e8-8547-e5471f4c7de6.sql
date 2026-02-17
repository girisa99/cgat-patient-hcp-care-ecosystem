-- Fix the remaining functions that need search path settings
ALTER FUNCTION public.generate_comprehensive_documentation() SET search_path TO 'public';
ALTER FUNCTION public.is_admin_user(uuid) SET search_path TO 'public';
ALTER FUNCTION public.is_admin_user_safe(uuid) SET search_path TO 'public';
ALTER FUNCTION public.sync_real_time_testing_updates() SET search_path TO 'public';