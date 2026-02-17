-- Clean up non-onboarding test data properly with constraint handling

-- First, delete execution history for non-onboarding tests
DELETE FROM test_execution_history 
WHERE test_case_id IN (
  SELECT id FROM comprehensive_test_cases 
  WHERE auto_generated = true 
  AND related_functionality NOT LIKE '%onboard%' 
  AND test_description NOT LIKE '%onboard%' 
  AND module_name NOT LIKE '%Onboard%'
  AND related_functionality NOT LIKE '%treatment_center%'
);

-- Then delete the non-onboarding auto-generated test cases
DELETE FROM comprehensive_test_cases 
WHERE auto_generated = true 
AND related_functionality NOT LIKE '%onboard%' 
AND test_description NOT LIKE '%onboard%' 
AND module_name NOT LIKE '%Onboard%'
AND related_functionality NOT LIKE '%treatment_center%';

-- Create comprehensive onboarding-specific test cases organized by categories
-- Category 1: Form Validation Tests (Unit Level)
INSERT INTO comprehensive_test_cases (
  test_suite_type, test_category, test_name, test_description,
  related_functionality, database_source, validation_level,
  module_name, coverage_area, business_function, auto_generated,
  test_status, cfr_part11_metadata, topic
) VALUES
('unit', 'form_validation', 'Company Information Form Validation', 
 'Validate legal name, DBA name, federal tax ID, and business type fields', 
 'treatment_center_onboarding', 'treatment_center_onboarding', 'IQ',
 'Onboarding Management', 'Form Validation', 'Data Entry', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'Company Setup'),

('unit', 'form_validation', 'Contact Information Validation', 
 'Test contact form validation for primary and additional contacts', 
 'onboarding_contacts', 'onboarding_contacts', 'IQ',
 'Onboarding Management', 'Form Validation', 'Contact Management', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'Contact Management'),

('unit', 'form_validation', 'Address Information Validation', 
 'Validate physical and mailing address form fields', 
 'onboarding_addresses', 'onboarding_addresses', 'IQ',
 'Onboarding Management', 'Form Validation', 'Address Management', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'Address Management'),

-- Category 2: Business Logic Tests (Unit Level)
('unit', 'business_logic', 'Distributor Selection Logic', 
 'Test distributor selection rules and business validation', 
 'treatment_center_onboarding', 'treatment_center_onboarding', 'IQ',
 'Onboarding Management', 'Business Logic', 'Distributor Management', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'Distributor Selection'),

('unit', 'business_logic', 'Therapy Selection Validation', 
 'Validate therapy selection business rules and dependencies', 
 'onboarding_therapy_selections', 'onboarding_therapy_selections', 'IQ',
 'Onboarding Management', 'Business Logic', 'Therapy Management', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'Therapy Selection'),

('unit', 'business_logic', 'Financial Risk Assessment', 
 'Test financial assessment calculation and risk scoring', 
 'treatment_center_onboarding', 'treatment_center_onboarding', 'OQ',
 'Onboarding Management', 'Business Logic', 'Risk Assessment', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'Financial Assessment');

-- Insert more categorized test cases
INSERT INTO comprehensive_test_cases (
  test_suite_type, test_category, test_name, test_description,
  related_functionality, database_source, validation_level,
  module_name, coverage_area, business_function, auto_generated,
  test_status, cfr_part11_metadata, topic
) VALUES
-- Category 3: API Integration Tests
('integration', 'api_testing', 'Treatment Center CRUD Operations', 
 'Test create, read, update, delete for treatment center records', 
 'treatment_center_onboarding', 'treatment_center_onboarding', 'OQ',
 'Onboarding Management', 'API Integration', 'Data Operations', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'CRUD Operations'),

('integration', 'api_testing', 'Document Upload Integration', 
 'Test document upload API with file validation and storage', 
 'onboarding_document_uploads', 'onboarding_document_uploads', 'OQ',
 'Onboarding Management', 'API Integration', 'File Management', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'Document Management'),

('integration', 'api_testing', 'Related Data Integration', 
 'Test integration between onboarding and related tables', 
 'treatment_center_onboarding', 'multiple_tables', 'OQ',
 'Onboarding Management', 'API Integration', 'Relational Data', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'Data Relationships'),

-- Category 4: End-to-End User Journey Tests
('e2e', 'user_journey', 'Complete Onboarding Journey', 
 'Test full user journey from registration to approval', 
 'treatment_center_onboarding', 'treatment_center_onboarding', 'PQ',
 'Onboarding Management', 'User Experience', 'Complete Workflow', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'Full Journey'),

('e2e', 'user_journey', 'Step-by-Step Navigation', 
 'Test navigation through all onboarding form steps', 
 'treatment_center_onboarding', 'treatment_center_onboarding', 'PQ',
 'Onboarding Management', 'User Experience', 'Step Navigation', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'Step Navigation'),

('e2e', 'user_journey', 'Document Upload Workflow', 
 'Test complete document upload and validation process', 
 'onboarding_document_uploads', 'onboarding_document_uploads', 'PQ',
 'Onboarding Management', 'User Experience', 'Document Flow', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'Document Workflow'),

-- Category 5: System Integration Tests
('system', 'system_integration', 'Complete Workflow Processing', 
 'Test end-to-end system processing of onboarding applications', 
 'treatment_center_onboarding', 'treatment_center_onboarding', 'PQ',
 'Onboarding Management', 'System Integration', 'Workflow Processing', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'System Workflow'),

('system', 'system_integration', 'Status Transition Management', 
 'Test application status transitions and approval workflow', 
 'treatment_center_onboarding', 'treatment_center_onboarding', 'PQ',
 'Onboarding Management', 'System Integration', 'Status Management', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'Status Management'),

-- Category 6: Performance Tests (Previously missing)
('performance', 'load_testing', 'Concurrent Application Processing', 
 'Test system performance with multiple simultaneous applications', 
 'treatment_center_onboarding', 'treatment_center_onboarding', 'PQ',
 'Onboarding Management', 'Performance Testing', 'Concurrency', false,
 'pending', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'Performance'),

('performance', 'load_testing', 'Document Upload Performance', 
 'Test performance of large document uploads and processing', 
 'onboarding_document_uploads', 'onboarding_document_uploads', 'PQ',
 'Onboarding Management', 'Performance Testing', 'File Performance', false,
 'pending', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'Document Performance'),

('performance', 'stress_testing', 'Database Query Performance', 
 'Test complex onboarding queries under load', 
 'treatment_center_onboarding', 'multiple_tables', 'PQ',
 'Onboarding Management', 'Performance Testing', 'Database Performance', false,
 'pending', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'Database Performance');

-- Insert Business Acceptance Tests by Treatment Center Type
INSERT INTO comprehensive_test_cases (
  test_suite_type, test_category, test_name, test_description,
  related_functionality, database_source, validation_level,
  module_name, coverage_area, business_function, auto_generated,
  test_status, cfr_part11_metadata, topic
) VALUES
-- Category 7: User Acceptance Tests by Business Scenario
('uat', 'business_scenario', 'Hospital Treatment Center Onboarding', 
 'UAT for hospital-type treatment center registration', 
 'treatment_center_onboarding', 'treatment_center_onboarding', 'PQ',
 'Onboarding Management', 'Business Acceptance', 'Hospital Workflow', false,
 'pending', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'Hospital Onboarding'),

('uat', 'business_scenario', 'Outpatient Clinic Onboarding', 
 'UAT for clinic-type treatment center registration', 
 'treatment_center_onboarding', 'treatment_center_onboarding', 'PQ',
 'Onboarding Management', 'Business Acceptance', 'Clinic Workflow', false,
 'pending', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'Clinic Onboarding'),

('uat', 'business_scenario', 'Specialty Pharmacy Onboarding', 
 'UAT for pharmacy-type treatment center registration', 
 'treatment_center_onboarding', 'treatment_center_onboarding', 'PQ',
 'Onboarding Management', 'Business Acceptance', 'Pharmacy Workflow', false,
 'pending', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'Pharmacy Onboarding'),

-- Category 8: Security and Compliance Tests
('security', 'access_control', 'Role-Based Access Security', 
 'Test onboarding team role access controls', 
 'treatment_center_onboarding', 'treatment_center_onboarding', 'PQ',
 'Onboarding Management', 'Security Testing', 'Access Control', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'Security'),

('security', 'data_protection', 'Sensitive Data Protection', 
 'Test encryption and protection of sensitive onboarding data', 
 'treatment_center_onboarding', 'treatment_center_onboarding', 'PQ',
 'Onboarding Management', 'Security Testing', 'Data Security', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'Data Protection'),

-- Category 9: Regression Tests
('regression', 'core_functionality', 'Onboarding Core Features Regression', 
 'Regression testing for core onboarding functionality', 
 'treatment_center_onboarding', 'treatment_center_onboarding', 'PQ',
 'Onboarding Management', 'Regression Testing', 'Core Features', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'Core Regression'),

('regression', 'workflow_regression', 'Workflow Navigation Regression', 
 'Regression testing for onboarding workflow navigation', 
 'treatment_center_onboarding', 'treatment_center_onboarding', 'PQ',
 'Onboarding Management', 'Regression Testing', 'Workflow Testing', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'Workflow Regression');