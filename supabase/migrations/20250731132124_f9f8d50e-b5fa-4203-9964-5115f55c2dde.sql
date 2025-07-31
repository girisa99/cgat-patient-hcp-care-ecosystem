-- Create role-based test case generation function
CREATE OR REPLACE FUNCTION public.generate_role_based_test_cases(target_role text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  test_cases_created INTEGER := 0;
  role_filter TEXT := COALESCE(target_role, 'all');
  batch_id UUID := gen_random_uuid();
BEGIN
  -- Generate test cases based on role
  IF role_filter = 'onboardingTeam' OR role_filter = 'all' THEN
    INSERT INTO comprehensive_test_cases (
      test_suite_type, test_category, test_name, test_description,
      related_functionality, validation_level, module_name, 
      coverage_area, business_function, auto_generated
    ) VALUES 
    ('system', 'onboarding_workflow', 'Onboarding User Registration Test', 
     'Test user registration and profile creation for onboarding team', 
     'user_registration', 'PQ', 'User Management', 'Core Functionality', 
     'User Onboarding', true),
    ('integration', 'facility_setup', 'Facility Configuration Test',
     'Test facility setup and configuration workflow',
     'facility_management', 'OQ', 'Facility Management', 'Governance & Compliance',
     'Facility Operations', true);
    
    test_cases_created := test_cases_created + 2;
  END IF;

  RETURN jsonb_build_object(
    'test_cases_created', test_cases_created,
    'batch_id', batch_id,
    'role_filter', role_filter,
    'timestamp', now()
  );
END;
$$;