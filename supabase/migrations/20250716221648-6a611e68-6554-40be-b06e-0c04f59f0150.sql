-- Fixed enhanced comprehensive test case generation with proper variable naming
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
  current_area TEXT;
  current_test_type TEXT;
  current_validation_level TEXT;
BEGIN
  -- Get functionality to test
  FOR func_rec IN
    SELECT * FROM system_functionality_registry
    WHERE (functionality_id IS NULL OR id = functionality_id)
    AND test_coverage_status IN ('uncovered', 'partial')
  LOOP
    -- Generate test cases for each coverage area and test type combination
    FOREACH current_area IN ARRAY coverage_areas
    LOOP
      FOREACH current_test_type IN ARRAY test_types
      LOOP
        FOREACH current_validation_level IN ARRAY validation_levels
        LOOP
          -- Check for duplicates before inserting
          IF NOT EXISTS (
            SELECT 1 FROM comprehensive_test_cases 
            WHERE related_functionality = func_rec.functionality_name
            AND coverage_area = current_area
            AND test_suite_type = current_test_type
            AND validation_level = current_validation_level
          ) THEN
            
            -- Insert comprehensive test case
            INSERT INTO comprehensive_test_cases (
              test_suite_type, test_category, test_name, test_description,
              related_functionality, database_source, validation_level,
              cfr_part11_metadata, execution_data, module_name, topic, 
              coverage_area, business_function, auto_generated,
              compliance_requirements
            ) VALUES (
              current_test_type,
              func_rec.functionality_type || '_' || current_test_type || '_' || LOWER(REPLACE(current_area, ' ', '_')),
              current_test_type || ' ' || current_area || ' Test: ' || func_rec.functionality_name,
              'Comprehensive ' || current_area || ' testing for ' || func_rec.functionality_name || 
              ' using ' || current_test_type || ' methodology with ' || current_validation_level || ' validation level',
              func_rec.functionality_name,
              func_rec.schema_name || '.' || func_rec.functionality_name,
              current_validation_level,
              jsonb_build_object(
                'compliance_level', '21_cfr_part_11',
                'validation_required', true,
                'electronic_signature_required', CASE WHEN current_validation_level IN ('OQ', 'PQ') THEN true ELSE false END,
                'coverage_area', current_area,
                'test_methodology', current_test_type,
                'validation_phase', current_validation_level,
                'risk_assessment_required', CASE WHEN current_area = 'Healthcare AI' THEN true ELSE false END,
                'governance_review', CASE WHEN current_area = 'Governance & Compliance' THEN true ELSE false END,
                'stability_monitoring', CASE WHEN current_area = 'Stability Testing' THEN true ELSE false END,
                'framework_validation', CASE WHEN current_area = 'Framework Testing' THEN true ELSE false END
              ),
              jsonb_build_object(
                'batch_id', batch_id, 
                'auto_generated', true,
                'test_methodology', current_test_type,
                'coverage_focus', current_area,
                'validation_protocol', current_validation_level,
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
                WHEN current_area = 'Core Functionality' THEN 'Functional Testing'
                WHEN current_area = 'Stability Testing' THEN 'System Stability'
                WHEN current_area = 'Governance & Compliance' THEN 'Regulatory Compliance'
                WHEN current_area = 'Verification & Validation' THEN 'V&V Testing'
                WHEN current_area = 'Healthcare AI' THEN 'AI/ML Validation'
                WHEN current_area = 'Framework Testing' THEN 'Framework Validation'
                ELSE current_area
              END,
              current_area,
              CASE 
                WHEN current_area = 'Core Functionality' THEN 'Business Operations'
                WHEN current_area = 'Stability Testing' THEN 'System Reliability'
                WHEN current_area = 'Governance & Compliance' THEN 'Regulatory Adherence'
                WHEN current_area = 'Verification & Validation' THEN 'Quality Assurance'
                WHEN current_area = 'Healthcare AI' THEN 'AI Safety & Efficacy'
                WHEN current_area = 'Framework Testing' THEN 'Platform Integrity'
                WHEN current_area = 'Security Testing' THEN 'Data Protection'
                WHEN current_area = 'Performance Testing' THEN 'System Performance'
                WHEN current_area = 'User Experience' THEN 'User Satisfaction'
                WHEN current_area = 'Data Integrity' THEN 'Data Quality'
                WHEN current_area = 'Audit & Traceability' THEN 'Compliance Monitoring'
                ELSE 'System Management'
              END,
              true,
              jsonb_build_object(
                '21_CFR_Part_11', jsonb_build_object(
                  'electronic_records', true,
                  'electronic_signatures', CASE WHEN current_validation_level IN ('OQ', 'PQ') THEN true ELSE false END,
                  'audit_trail', true,
                  'system_validation', true
                ),
                'validation_plan', jsonb_build_object(
                  'IQ_requirements', CASE WHEN current_validation_level = 'IQ' THEN true ELSE false END,
                  'OQ_requirements', CASE WHEN current_validation_level = 'OQ' THEN true ELSE false END,
                  'PQ_requirements', CASE WHEN current_validation_level = 'PQ' THEN true ELSE false END
                ),
                'risk_assessment', jsonb_build_object(
                  'required', CASE WHEN current_area IN ('Healthcare AI', 'Governance & Compliance') THEN true ELSE false END,
                  'level', CASE WHEN current_area = 'Healthcare AI' THEN 'high' ELSE 'medium' END
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