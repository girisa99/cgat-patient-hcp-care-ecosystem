-- Update the check constraint to include all needed test suite types
ALTER TABLE comprehensive_test_cases 
DROP CONSTRAINT comprehensive_test_cases_test_suite_type_check;

ALTER TABLE comprehensive_test_cases 
ADD CONSTRAINT comprehensive_test_cases_test_suite_type_check 
CHECK (test_suite_type = ANY (ARRAY['unit'::text, 'integration'::text, 'system'::text, 'regression'::text, 'uat'::text, 'api_integration'::text, 'e2e'::text, 'performance'::text]));

-- Now generate the missing E2E test cases
INSERT INTO comprehensive_test_cases (
  test_suite_type, test_category, test_name, test_description,
  related_functionality, database_source, validation_level,
  cfr_part11_metadata, execution_data, module_name, topic, 
  coverage_area, business_function, auto_generated
)
SELECT 
  'e2e' as test_suite_type,
  'table_e2e_tests' as test_category,
  'E2E Test: ' || functionality_name as test_name,
  'End-to-end test covering complete user workflow for ' || functionality_name as test_description,
  functionality_name as related_functionality,
  'public.' || functionality_name as database_source,
  'PQ' as validation_level,
  jsonb_build_object(
    'compliance_level', '21_cfr_part_11',
    'validation_required', true,
    'electronic_signature_required', true,
    'workflow_testing', true,
    'user_acceptance_criteria', true
  ) as cfr_part11_metadata,
  jsonb_build_object('test_type', 'e2e', 'auto_generated', true, 'workflow_complete', true) as execution_data,
  CASE 
    WHEN functionality_name LIKE '%user%' OR functionality_name LIKE '%profile%' THEN 'User Management'
    WHEN functionality_name LIKE '%api%' OR functionality_name LIKE '%integration%' THEN 'API Integration'
    WHEN functionality_name LIKE '%audit%' OR functionality_name LIKE '%log%' THEN 'Audit & Compliance'
    WHEN functionality_name LIKE '%facility%' THEN 'Facility Management'
    WHEN functionality_name LIKE '%role%' OR functionality_name LIKE '%permission%' THEN 'Role Management'
    ELSE 'Core System'
  END as module_name,
  'End-to-End Testing' as topic,
  'User Workflows' as coverage_area,
  'Complete User Journey' as business_function,
  true as auto_generated
FROM system_functionality_registry 
WHERE functionality_type = 'table'
AND test_coverage_status = 'comprehensive'
LIMIT 20;

-- Generate System Testing cases  
INSERT INTO comprehensive_test_cases (
  test_suite_type, test_category, test_name, test_description,
  related_functionality, database_source, validation_level,
  cfr_part11_metadata, execution_data, module_name, topic, 
  coverage_area, business_function, auto_generated
)
SELECT 
  'system' as test_suite_type,
  'table_system_tests' as test_category,
  'System Test: ' || functionality_name as test_name,
  'System-level test validating ' || functionality_name || ' performance and reliability' as test_description,
  functionality_name as related_functionality,
  'public.' || functionality_name as database_source,
  'PQ' as validation_level,
  jsonb_build_object(
    'compliance_level', '21_cfr_part_11',
    'validation_required', true,
    'performance_testing', true,
    'load_testing', true,
    'system_integration', true
  ) as cfr_part11_metadata,
  jsonb_build_object('test_type', 'system', 'auto_generated', true, 'performance_critical', true) as execution_data,
  CASE 
    WHEN functionality_name LIKE '%user%' OR functionality_name LIKE '%profile%' THEN 'User Management'
    WHEN functionality_name LIKE '%api%' OR functionality_name LIKE '%integration%' THEN 'API Integration'
    WHEN functionality_name LIKE '%audit%' OR functionality_name LIKE '%log%' THEN 'Audit & Compliance'
    WHEN functionality_name LIKE '%facility%' THEN 'Facility Management'
    WHEN functionality_name LIKE '%role%' OR functionality_name LIKE '%permission%' THEN 'Role Management'
    ELSE 'Core System'
  END as module_name,
  'System Testing' as topic,
  'System Performance' as coverage_area,
  'System Reliability' as business_function,
  true as auto_generated
FROM system_functionality_registry 
WHERE functionality_type = 'table'
AND test_coverage_status = 'comprehensive'
LIMIT 20;

-- Generate UAT (User Acceptance Testing) cases
INSERT INTO comprehensive_test_cases (
  test_suite_type, test_category, test_name, test_description,
  related_functionality, database_source, validation_level,
  cfr_part11_metadata, execution_data, module_name, topic, 
  coverage_area, business_function, auto_generated
)
SELECT 
  'uat' as test_suite_type,
  'table_uat_tests' as test_category,
  'UAT Test: ' || functionality_name as test_name,
  'User acceptance test validating business requirements for ' || functionality_name as test_description,
  functionality_name as related_functionality,
  'public.' || functionality_name as database_source,
  'PQ' as validation_level,
  jsonb_build_object(
    'compliance_level', '21_cfr_part_11',
    'validation_required', true,
    'user_acceptance_required', true,
    'business_validation', true,
    'stakeholder_approval', true
  ) as cfr_part11_metadata,
  jsonb_build_object('test_type', 'uat', 'auto_generated', true, 'business_critical', true) as execution_data,
  CASE 
    WHEN functionality_name LIKE '%user%' OR functionality_name LIKE '%profile%' THEN 'User Management'
    WHEN functionality_name LIKE '%api%' OR functionality_name LIKE '%integration%' THEN 'API Integration'
    WHEN functionality_name LIKE '%audit%' OR functionality_name LIKE '%log%' THEN 'Audit & Compliance'
    WHEN functionality_name LIKE '%facility%' THEN 'Facility Management'
    WHEN functionality_name LIKE '%role%' OR functionality_name LIKE '%permission%' THEN 'Role Management'
    ELSE 'Core System'
  END as module_name,
  'User Acceptance Testing' as topic,
  'Business Requirements' as coverage_area,
  'User Satisfaction' as business_function,
  true as auto_generated
FROM system_functionality_registry 
WHERE functionality_type = 'table'
AND test_coverage_status = 'comprehensive'
LIMIT 20;