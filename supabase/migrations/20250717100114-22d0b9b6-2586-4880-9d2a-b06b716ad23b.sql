-- COMPREHENSIVE DATABASE INTEGRITY SYSTEM
-- Add foreign key constraints, check constraints, and enhanced RLS

-- Add foreign key constraints for data integrity
ALTER TABLE public.profiles 
ADD CONSTRAINT fk_profiles_facility 
FOREIGN KEY (facility_id) REFERENCES public.facilities(id) ON DELETE SET NULL;

ALTER TABLE public.user_roles 
ADD CONSTRAINT fk_user_roles_user 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.user_roles 
ADD CONSTRAINT fk_user_roles_role 
FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;

-- Add check constraints for data validation
ALTER TABLE public.profiles 
ADD CONSTRAINT check_email_format 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE public.profiles 
ADD CONSTRAINT check_phone_format 
CHECK (phone IS NULL OR phone ~* '^\+?[1-9]\d{1,14}$');

ALTER TABLE public.facilities 
ADD CONSTRAINT check_facility_type_valid 
CHECK (facility_type IN ('hospital', 'clinic', 'pharmacy', 'laboratory', 'other'));

-- Enhanced RLS policies for stricter security
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
CREATE POLICY "Super admins can view all profiles" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    JOIN public.roles r ON r.id = ur.role_id 
    WHERE ur.user_id = auth.uid() 
    AND r.name = 'superAdmin'
  )
);

-- Create database monitoring functions
CREATE OR REPLACE FUNCTION public.check_database_integrity()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb := '{}';
  orphaned_records integer;
  invalid_emails integer;
  missing_roles integer;
BEGIN
  -- Check for orphaned user_roles
  SELECT COUNT(*) INTO orphaned_records
  FROM public.user_roles ur
  LEFT JOIN public.profiles p ON p.id = ur.user_id
  WHERE p.id IS NULL;
  
  -- Check for invalid email formats
  SELECT COUNT(*) INTO invalid_emails
  FROM public.profiles
  WHERE email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
  
  -- Check for users without roles
  SELECT COUNT(*) INTO missing_roles
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON ur.user_id = p.id
  WHERE ur.user_id IS NULL;
  
  result := jsonb_build_object(
    'timestamp', now(),
    'orphaned_user_roles', orphaned_records,
    'invalid_emails', invalid_emails,
    'users_without_roles', missing_roles,
    'integrity_score', CASE 
      WHEN orphaned_records + invalid_emails + missing_roles = 0 THEN 100
      ELSE 100 - LEAST(50, (orphaned_records + invalid_emails + missing_roles) * 5)
    END
  );
  
  RETURN result;
END;
$$;

-- Create performance monitoring function
CREATE OR REPLACE FUNCTION public.get_database_performance_metrics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb := '{}';
  slow_queries integer;
  table_sizes jsonb;
  connection_count integer;
BEGIN
  -- Get table sizes
  SELECT jsonb_object_agg(
    schemaname||'.'||tablename, 
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
  ) INTO table_sizes
  FROM pg_tables 
  WHERE schemaname = 'public';
  
  -- Get connection count
  SELECT COUNT(*) INTO connection_count
  FROM pg_stat_activity
  WHERE state = 'active';
  
  result := jsonb_build_object(
    'timestamp', now(),
    'table_sizes', table_sizes,
    'active_connections', connection_count,
    'database_size', pg_size_pretty(pg_database_size(current_database()))
  );
  
  RETURN result;
END;
$$;