-- Create role-based test case generation function
CREATE OR REPLACE FUNCTION public.generate_role_based_test_cases(target_role user_role DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  func_rec RECORD;
  test_cases_created INTEGER := 0;
  batch_id UUID := gen_random_uuid();
  role_filter TEXT;
BEGIN
  -- Set role-specific functionality filter
  CASE target_role
    WHEN 'onboardingTeam' THEN role_filter := '%onboard%|%facility%|%user%|%profile%';
    WHEN 'patientCaregiver' THEN role_filter := '%patient%|%clinical%|%care%|%treatment%';
    WHEN 'superAdmin' THEN role_filter := '%admin%|%system%|%audit%|%security%';
    ELSE role_filter := '.*'; -- All functionality for NULL or unknown roles
  END CASE;

  -- Generate test cases for role-specific functionality
  FOR func_rec IN
    SELECT * FROM system_functionality_registry
    WHERE (target_role IS NULL OR functionality_name ~* role_filter)
    AND test_coverage_status IN ('uncovered', 'partial')
  LOOP
    -- Generate core functionality tests
    INSERT INTO comprehensive_test_cases (
      test_suite_type, test_category, test_name, test_description,
      related_functionality, database_source, validation_level,
      cfr_part11_metadata, execution_data, module_name, 
      coverage_area, business_function, auto_generated,
      compliance_requirements
    ) VALUES (
      'integration',
      func_rec.functionality_type || '_role_based_' || COALESCE(target_role::text, 'all_roles'),
      'Role-Based ' || COALESCE(target_role::text, 'Multi-Role') || ' Test: ' || func_rec.functionality_name,
      'Role-specific testing for ' || func_rec.functionality_name || 
      ' targeting ' || COALESCE(target_role::text, 'all user roles') || ' access patterns and permissions',
      func_rec.functionality_name,
      func_rec.schema_name || '.' || func_rec.functionality_name,
      'PQ',
      jsonb_build_object(
        'compliance_level', '21_cfr_part_11',
        'role_specific', true,
        'target_role', COALESCE(target_role::text, 'all_roles'),
        'access_control_testing', true,
        'permission_validation', true
      ),
      jsonb_build_object(
        'batch_id', batch_id,
        'role_based_generation', true,
        'target_role', COALESCE(target_role::text, 'all_roles'),
        'test_methodology', 'role_based_integration'
      ),
      CASE 
        WHEN func_rec.functionality_name ~* 'user|profile|onboard' THEN 'User Management'
        WHEN func_rec.functionality_name ~* 'patient|clinical|care' THEN 'Patient Management'
        WHEN func_rec.functionality_name ~* 'facility|organization' THEN 'Facility Management'
        WHEN func_rec.functionality_name ~* 'admin|system|security' THEN 'System Administration'
        ELSE 'Core System'
      END,
      'Role-Based Testing',
      CASE 
        WHEN target_role = 'onboardingTeam' THEN 'Onboarding Operations'
        WHEN target_role = 'patientCaregiver' THEN 'Patient Care Operations'
        WHEN target_role = 'superAdmin' THEN 'System Administration'
        ELSE 'Multi-Role Operations'
      END,
      true,
      jsonb_build_object(
        'role_access_control', jsonb_build_object(
          'target_role', COALESCE(target_role::text, 'all_roles'),
          'permission_matrix', true,
          'access_validation', true
        ),
        'security_testing', jsonb_build_object(
          'rls_validation', true,
          'unauthorized_access_prevention', true
        )
      )
    );
    
    test_cases_created := test_cases_created + 1;

    -- Update coverage status
    UPDATE system_functionality_registry 
    SET test_coverage_status = 'role_based_covered', 
        last_analyzed_at = now()
    WHERE id = func_rec.id;
  END LOOP;

  RETURN jsonb_build_object(
    'test_cases_created', test_cases_created,
    'batch_id', batch_id,
    'target_role', COALESCE(target_role::text, 'all_roles'),
    'timestamp', now()
  );
END;
$function$;

-- Create role-based testing synchronization function
CREATE OR REPLACE FUNCTION public.sync_role_based_testing()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  role_rec RECORD;
BEGIN
  -- Sync test cases for each role
  FOR role_rec IN SELECT DISTINCT name FROM roles WHERE name IN ('onboardingTeam', 'patientCaregiver', 'superAdmin')
  LOOP
    PERFORM public.generate_role_based_test_cases(role_rec.name::user_role);
  END LOOP;
  
  -- Log the synchronization
  PERFORM public.log_verification_activity(
    'role_based_test_sync',
    'Synchronized role-based test cases for all roles',
    jsonb_build_object('sync_timestamp', now(), 'roles_processed', 3)
  );
END;
$function$;

-- Create trigger for automatic role-based test synchronization
CREATE OR REPLACE FUNCTION public.trigger_auto_sync_role_tests()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only trigger on new functionality or coverage status changes
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.test_coverage_status != NEW.test_coverage_status) THEN
    -- Schedule background sync (using notify for async processing)
    NOTIFY role_based_test_sync, NEW.id::text;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Create the trigger on system_functionality_registry
DROP TRIGGER IF EXISTS auto_sync_role_tests ON system_functionality_registry;
CREATE TRIGGER auto_sync_role_tests
  AFTER INSERT OR UPDATE ON system_functionality_registry
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_auto_sync_role_tests();