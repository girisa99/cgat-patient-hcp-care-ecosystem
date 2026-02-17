-- Fixed enhanced comprehensive test case generation with all required coverage areas
-- Including stability, governance, verification, healthcare AI, and framework testing
-- With continuous iteration and duplicate prevention

-- First, update the existing test generation function to include all coverage areas
CREATE OR REPLACE FUNCTION public.generate_comprehensive_test_cases_enhanced(functionality_id uuid DEFAULT NULL::uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  func_rec RECORD;
  test_cases_created INTEGER := 0;
  batch_id UUID := gen_random_uuid();
  coverage_areas TEXT[] := ARRAY[
    'Core Functionality',
    'Stability Testing', 
    'Governance & Compliance',
    'Verification & Validation',
    'Healthcare AI',
    'Framework Testing',
    'Security Testing',
    'Performance Testing',
    'User Experience',
    'Data Integrity',
    'Audit & Traceability'
  ];
  test_types TEXT[] := ARRAY['unit', 'integration', 'system', 'e2e', 'uat', 'regression'];
  validation_levels TEXT[] := ARRAY['IQ', 'OQ', 'PQ'];
  area TEXT;
  test_type TEXT;
  validation_level TEXT;
BEGIN
  -- Get functionality to test
  FOR func_rec IN
    SELECT * FROM system_functionality_registry
    WHERE (functionality_id IS NULL OR id = functionality_id)
    AND test_coverage_status IN ('uncovered', 'partial')
  LOOP
    -- Generate test cases for each coverage area and test type combination
    FOREACH area IN ARRAY coverage_areas
    LOOP
      FOREACH test_type IN ARRAY test_types
      LOOP
        FOREACH validation_level IN ARRAY validation_levels
        LOOP
          -- Check for duplicates before inserting (fixed column reference)
          IF NOT EXISTS (
            SELECT 1 FROM comprehensive_test_cases 
            WHERE related_functionality = func_rec.functionality_name
            AND coverage_area = area
            AND test_suite_type = test_type
            AND comprehensive_test_cases.validation_level = validation_level
          ) THEN
            
            -- Insert comprehensive test case
            INSERT INTO comprehensive_test_cases (
              test_suite_type, test_category, test_name, test_description,
              related_functionality, database_source, validation_level,
              cfr_part11_metadata, execution_data, module_name, topic, 
              coverage_area, business_function, auto_generated,
              compliance_requirements
            ) VALUES (
              test_type,
              func_rec.functionality_type || '_' || test_type || '_' || LOWER(REPLACE(area, ' ', '_')),
              test_type || ' ' || area || ' Test: ' || func_rec.functionality_name,
              'Comprehensive ' || area || ' testing for ' || func_rec.functionality_name || 
              ' using ' || test_type || ' methodology with ' || validation_level || ' validation level',
              func_rec.functionality_name,
              func_rec.schema_name || '.' || func_rec.functionality_name,
              validation_level,
              jsonb_build_object(
                'compliance_level', '21_cfr_part_11',
                'validation_required', true,
                'electronic_signature_required', CASE WHEN validation_level IN ('OQ', 'PQ') THEN true ELSE false END,
                'coverage_area', area,
                'test_methodology', test_type,
                'validation_phase', validation_level,
                'risk_assessment_required', CASE WHEN area = 'Healthcare AI' THEN true ELSE false END,
                'governance_review', CASE WHEN area = 'Governance & Compliance' THEN true ELSE false END,
                'stability_monitoring', CASE WHEN area = 'Stability Testing' THEN true ELSE false END,
                'framework_validation', CASE WHEN area = 'Framework Testing' THEN true ELSE false END
              ),
              jsonb_build_object(
                'batch_id', batch_id, 
                'auto_generated', true,
                'test_methodology', test_type,
                'coverage_focus', area,
                'validation_protocol', validation_level,
                'traceability_required', true,
                'documentation_level', 'comprehensive'
              ),
              CASE 
                WHEN func_rec.functionality_name LIKE '%user%' OR func_rec.functionality_name LIKE '%profile%' THEN 'User Management'
                WHEN func_rec.functionality_name LIKE '%patient%' OR func_rec.functionality_name LIKE '%clinical%' THEN 'Patient Management'
                WHEN func_rec.functionality_name LIKE '%facility%' OR func_rec.functionality_name LIKE '%onboarding%' THEN 'Facility Management'
                WHEN func_rec.functionality_name LIKE '%api%' OR func_rec.functionality_name LIKE '%integration%' THEN 'API Integration'
                WHEN func_rec.functionality_name LIKE '%audit%' OR func_rec.functionality_name LIKE '%log%' THEN 'Audit & Compliance'
                WHEN func_rec.functionality_name LIKE '%notification%' OR func_rec.functionality_name LIKE '%alert%' THEN 'Communication'
                WHEN func_rec.functionality_name LIKE '%test%' OR func_rec.functionality_name LIKE '%validation%' THEN 'Testing Framework'
                WHEN func_rec.functionality_name LIKE '%ai%' OR func_rec.functionality_name LIKE '%ml%' THEN 'Healthcare AI'
                ELSE 'Core System'
              END,
              CASE 
                WHEN area = 'Core Functionality' THEN 'Functional Testing'
                WHEN area = 'Stability Testing' THEN 'System Stability'
                WHEN area = 'Governance & Compliance' THEN 'Regulatory Compliance'
                WHEN area = 'Verification & Validation' THEN 'V&V Testing'
                WHEN area = 'Healthcare AI' THEN 'AI/ML Validation'
                WHEN area = 'Framework Testing' THEN 'Framework Validation'
                ELSE area
              END,
              area,
              CASE 
                WHEN area = 'Core Functionality' THEN 'Business Operations'
                WHEN area = 'Stability Testing' THEN 'System Reliability'
                WHEN area = 'Governance & Compliance' THEN 'Regulatory Adherence'
                WHEN area = 'Verification & Validation' THEN 'Quality Assurance'
                WHEN area = 'Healthcare AI' THEN 'AI Safety & Efficacy'
                WHEN area = 'Framework Testing' THEN 'Platform Integrity'
                WHEN area = 'Security Testing' THEN 'Data Protection'
                WHEN area = 'Performance Testing' THEN 'System Performance'
                WHEN area = 'User Experience' THEN 'User Satisfaction'
                WHEN area = 'Data Integrity' THEN 'Data Quality'
                WHEN area = 'Audit & Traceability' THEN 'Compliance Monitoring'
                ELSE 'System Management'
              END,
              true,
              jsonb_build_object(
                '21_CFR_Part_11', jsonb_build_object(
                  'electronic_records', true,
                  'electronic_signatures', CASE WHEN validation_level IN ('OQ', 'PQ') THEN true ELSE false END,
                  'audit_trail', true,
                  'system_validation', true
                ),
                'validation_plan', jsonb_build_object(
                  'IQ_requirements', CASE WHEN validation_level = 'IQ' THEN true ELSE false END,
                  'OQ_requirements', CASE WHEN validation_level = 'OQ' THEN true ELSE false END,
                  'PQ_requirements', CASE WHEN validation_level = 'PQ' THEN true ELSE false END
                ),
                'risk_assessment', jsonb_build_object(
                  'required', CASE WHEN area IN ('Healthcare AI', 'Governance & Compliance') THEN true ELSE false END,
                  'level', CASE WHEN area = 'Healthcare AI' THEN 'high' ELSE 'medium' END
                ),
                'traceability_matrix', jsonb_build_object(
                  'user_requirements', true,
                  'functional_specifications', true,
                  'test_cases', true,
                  'test_results', true
                )
              )
            );
            
            test_cases_created := test_cases_created + 1;
          END IF;
        END LOOP;
      END LOOP;
    END LOOP;

    -- Update coverage status
    UPDATE system_functionality_registry 
    SET test_coverage_status = 'comprehensive', last_analyzed_at = now()
    WHERE id = func_rec.id;
  END LOOP;

  RETURN jsonb_build_object(
    'test_cases_created', test_cases_created,
    'batch_id', batch_id,
    'coverage_areas', coverage_areas,
    'test_types', test_types,
    'validation_levels', validation_levels,
    'timestamp', now()
  );
END;
$function$;

-- Create function for continuous functionality detection and test generation
CREATE OR REPLACE FUNCTION public.continuous_test_generation()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  detection_result jsonb;
  generation_result jsonb;
BEGIN
  -- First detect new functionality
  PERFORM public.detect_system_functionality();
  
  -- Then generate comprehensive test cases for new functionality
  SELECT public.generate_comprehensive_test_cases_enhanced() INTO generation_result;
  
  -- Log the continuous generation activity
  INSERT INTO functionality_change_detection (
    change_type, change_description, 
    impact_analysis, metadata, processing_status
  ) VALUES (
    'continuous_testing', 
    'Automated test generation for new functionality',
    jsonb_build_object('test_cases_generated', generation_result->'test_cases_created'),
    jsonb_build_object('generation_result', generation_result),
    'completed'
  );
  
  RETURN jsonb_build_object(
    'status', 'success',
    'generation_result', generation_result,
    'timestamp', now()
  );
END;
$function$;

-- Create trigger to automatically generate tests when new functionality is detected
CREATE OR REPLACE FUNCTION public.auto_generate_tests_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Only trigger for new uncovered functionality
  IF NEW.test_coverage_status = 'uncovered' AND (OLD.test_coverage_status IS NULL OR OLD.test_coverage_status != 'uncovered') THEN
    -- Asynchronously generate test cases for this specific functionality
    PERFORM public.generate_comprehensive_test_cases_enhanced(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create the trigger
DROP TRIGGER IF EXISTS auto_test_generation ON system_functionality_registry;
CREATE TRIGGER auto_test_generation
  AFTER INSERT OR UPDATE ON system_functionality_registry
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_tests_trigger();