-- Fix only the functions that actually exist
ALTER FUNCTION public.is_admin_user(uuid) SET search_path TO 'public';
ALTER FUNCTION public.is_admin_user_safe(uuid) SET search_path TO 'public';

-- Check if other functions exist before altering them
DO $$
BEGIN
  -- Try to alter sync_real_time_testing_updates if it exists
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'sync_real_time_testing_updates') THEN
    EXECUTE 'ALTER FUNCTION public.sync_real_time_testing_updates() SET search_path TO ''public''';
  END IF;
  
  -- Try to alter generate_comprehensive_documentation if it exists  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'generate_comprehensive_documentation') THEN
    EXECUTE 'ALTER FUNCTION public.generate_comprehensive_documentation() SET search_path TO ''public''';
  END IF;
END $$;