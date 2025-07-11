
-- Add module and topic categorization to comprehensive test cases
ALTER TABLE comprehensive_test_cases 
ADD COLUMN module_name TEXT,
ADD COLUMN topic TEXT,
ADD COLUMN coverage_area TEXT,
ADD COLUMN business_function TEXT;

-- Add indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_comprehensive_test_cases_module ON comprehensive_test_cases(module_name);
CREATE INDEX IF NOT EXISTS idx_comprehensive_test_cases_topic ON comprehensive_test_cases(topic);
CREATE INDEX IF NOT EXISTS idx_comprehensive_test_cases_coverage_area ON comprehensive_test_cases(coverage_area);
CREATE INDEX IF NOT EXISTS idx_comprehensive_test_cases_business_function ON comprehensive_test_cases(business_function);

-- Update the test case generation function to include module and topic categorization
CREATE OR REPLACE FUNCTION public.generate_comprehensive_test_cases(functionality_id uuid DEFAULT NULL::uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  func_rec RECORD;
  test_cases_created INTEGER := 0;
  batch_id UUID := gen_random_uuid();
  module_name TEXT;
  topic TEXT;
  coverage_area TEXT;
  business_function TEXT;
BEGIN
  -- Get functionality to test
  FOR func_rec IN
    SELECT * FROM system_functionality_registry
    WHERE (functionality_id IS NULL OR id = functionality_id)
    AND test_coverage_status IN ('uncovered', 'partial')
  LOOP
    -- Determine module and categorization based on functionality name
    CASE 
      WHEN func_rec.functionality_name LIKE '%user%' OR func_rec.functionality_name LIKE '%profile%' THEN
        module_name := 'User Management';
        topic := 'Authentication & Authorization';
        coverage_area := 'Security';
        business_function := 'User Administration';
      WHEN func_rec.functionality_name LIKE '%patient%' OR func_rec.functionality_name LIKE '%clinical%' THEN
        module_name := 'Patient Management';
        topic := 'Clinical Data';
        coverage_area := 'Healthcare';
        business_function := 'Patient Care';
      WHEN func_rec.functionality_name LIKE '%facility%' OR func_rec.functionality_name LIKE '%onboarding%' THEN
        module_name := 'Facility Management';
        topic := 'Organizational Setup';
        coverage_area := 'Operations';
        business_function := 'Business Operations';
      WHEN func_rec.functionality_name LIKE '%api%' OR func_rec.functionality_name LIKE '%integration%' THEN
        module_name := 'API Integration';
        topic := 'System Integration';
        coverage_area := 'Technical';
        business_function := 'Data Exchange';
      WHEN func_rec.functionality_name LIKE '%audit%' OR func_rec.functionality_name LIKE '%log%' THEN
        module_name := 'Audit & Compliance';
        topic := 'Regulatory Compliance';
        coverage_area := 'Compliance';
        business_function := 'Audit Trail';
      WHEN func_rec.functionality_name LIKE '%notification%' OR func_rec.functionality_name LIKE '%alert%' THEN
        module_name := 'Communication';
        topic := 'Notifications';
        coverage_area := 'User Experience';
        business_function := 'Communication';
      ELSE
        module_name := 'Core System';
        topic := 'System Operations';
        coverage_area := 'Technical';
        business_function := 'System Management';
    END CASE;
    
    -- Generate Unit Tests with module categorization
    INSERT INTO comprehensive_test_cases (
      test_suite_type, test_category, test_name, test_description,
      related_functionality, database_source, validation_level,
      cfr_part11_metadata, execution_data, module_name, topic, 
      coverage_area, business_function
    ) VALUES (
      'unit',
      func_rec.functionality_type || '_unit_tests',
      'Unit Test: ' || func_rec.functionality_name,
      'Automated unit test for ' || func_rec.functionality_name || ' in ' || module_name || ' module',
      func_rec.functionality_name,
      func_rec.schema_name || '.' || func_rec.functionality_name,
      'IQ',
      jsonb_build_object(
        'compliance_level', '21_cfr_part_11',
        'validation_required', true,
        'electronic_signature_required', false,
        'module', module_name,
        'topic', topic
      ),
      jsonb_build_object('batch_id', batch_id, 'auto_generated', true),
      module_name, topic, coverage_area, business_function
    );
    
    test_cases_created := test_cases_created + 1;
    
    -- Generate Integration Tests with module categorization
    INSERT INTO comprehensive_test_cases (
      test_suite_type, test_category, test_name, test_description,
      related_functionality, database_source, validation_level,
      cfr_part11_metadata, execution_data, module_name, topic,
      coverage_area, business_function
    ) VALUES (
      'integration',
      func_rec.functionality_type || '_integration_tests',
      'Integration Test: ' || func_rec.functionality_name,
      'Integration test for ' || func_rec.functionality_name || ' within ' || module_name || ' module ecosystem',
      func_rec.functionality_name,
      func_rec.schema_name || '.' || func_rec.functionality_name,
      'OQ',
      jsonb_build_object(
        'compliance_level', '21_cfr_part_11',
        'validation_required', true,
        'electronic_signature_required', true,
        'module', module_name,
        'topic', topic
      ),
      jsonb_build_object('batch_id', batch_id, 'auto_generated', true),
      module_name, topic, coverage_area, business_function
    );
    
    test_cases_created := test_cases_created + 1;

    -- Update coverage status
    UPDATE system_functionality_registry 
    SET test_coverage_status = 'partial', last_analyzed_at = now()
    WHERE id = func_rec.id;
  END LOOP;

  RETURN test_cases_created;
END;
$function$;
