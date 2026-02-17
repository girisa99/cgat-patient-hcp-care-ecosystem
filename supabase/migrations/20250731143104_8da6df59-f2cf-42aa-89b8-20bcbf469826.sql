-- Clean up non-onboarding auto-generated test cases and create onboarding-specific tests

-- First, delete non-onboarding auto-generated tests
DELETE FROM comprehensive_test_cases 
WHERE auto_generated = true 
AND related_functionality NOT LIKE '%onboard%' 
AND test_description NOT LIKE '%onboard%' 
AND module_name NOT LIKE '%Onboard%'
AND related_functionality NOT LIKE '%treatment_center%';

-- Create comprehensive onboarding-specific test cases
-- Treatment Center Onboarding Core Workflow Tests
INSERT INTO comprehensive_test_cases (
  test_suite_type, test_category, test_name, test_description,
  related_functionality, database_source, validation_level,
  module_name, coverage_area, business_function, auto_generated,
  test_status, cfr_part11_metadata
) VALUES
-- Unit Tests for Onboarding Components
('unit', 'onboarding_form_validation', 'Company Information Form Unit Test', 
 'Validate company info form fields: legal name, tax ID, business type', 
 'treatment_center_onboarding', 'treatment_center_onboarding', 'IQ',
 'Onboarding Management', 'Core Functionality', 'Form Validation', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}'),

('unit', 'onboarding_data_validation', 'Distributor Selection Validation Unit Test', 
 'Test distributor selection logic and validation rules', 
 'treatment_center_onboarding', 'treatment_center_onboarding', 'IQ',
 'Onboarding Management', 'Data Validation', 'Business Logic', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}'),

('unit', 'onboarding_workflow', 'Therapy Selection Unit Test', 
 'Validate therapy selection workflow and dependencies', 
 'onboarding_therapy_selections', 'onboarding_therapy_selections', 'IQ',
 'Onboarding Management', 'Business Logic', 'Workflow Processing', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}'),

('unit', 'onboarding_financial', 'Financial Assessment Validation Unit Test', 
 'Test financial data validation and risk scoring', 
 'treatment_center_onboarding', 'treatment_center_onboarding', 'OQ',
 'Onboarding Management', 'Financial Validation', 'Risk Assessment', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}'),

-- Integration Tests for Onboarding APIs
('integration', 'onboarding_api_crud', 'Treatment Center CRUD API Integration Test', 
 'Test create, read, update, delete operations for treatment center data', 
 'treatment_center_onboarding', 'treatment_center_onboarding', 'OQ',
 'Onboarding Management', 'API Integration', 'Data Management', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}'),

('integration', 'onboarding_document_api', 'Document Upload API Integration Test', 
 'Test document upload, validation, and storage integration', 
 'onboarding_document_uploads', 'onboarding_document_uploads', 'OQ',
 'Onboarding Management', 'Document Management', 'File Processing', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}'),

('integration', 'onboarding_relationship_api', 'Onboarding Relationships Integration Test', 
 'Test integration between main onboarding and related tables', 
 'treatment_center_onboarding', 'multiple_tables', 'OQ',
 'Onboarding Management', 'Database Integration', 'Relational Data', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}'),

-- System Tests for Complete Onboarding Workflow
('system', 'onboarding_complete_workflow', 'Complete Treatment Center Onboarding System Test', 
 'End-to-end test of complete onboarding workflow from start to approval', 
 'treatment_center_onboarding', 'treatment_center_onboarding', 'PQ',
 'Onboarding Management', 'Complete Workflow', 'Business Process', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}'),

('system', 'onboarding_multi_step', 'Multi-Step Onboarding System Test', 
 'Test navigation between onboarding steps and data persistence', 
 'treatment_center_onboarding', 'treatment_center_onboarding', 'PQ',
 'Onboarding Management', 'Step Navigation', 'User Workflow', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}'),

('system', 'onboarding_approval_workflow', 'Onboarding Approval System Test', 
 'Test complete approval workflow and status transitions', 
 'treatment_center_onboarding', 'treatment_center_onboarding', 'PQ',
 'Onboarding Management', 'Approval Process', 'Status Management', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}'),

-- E2E Tests for User Journey
('e2e', 'onboarding_user_journey', 'Treatment Center Registration E2E Test', 
 'Complete user journey from initial registration to approval', 
 'treatment_center_onboarding', 'treatment_center_onboarding', 'PQ',
 'Onboarding Management', 'User Experience', 'Complete Journey', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}'),

('e2e', 'onboarding_form_navigation', 'Onboarding Form Navigation E2E Test', 
 'Test user navigation through all onboarding form sections', 
 'treatment_center_onboarding', 'treatment_center_onboarding', 'PQ',
 'Onboarding Management', 'Form Navigation', 'User Interface', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}'),

('e2e', 'onboarding_document_flow', 'Document Upload Workflow E2E Test', 
 'Test complete document upload and validation workflow', 
 'onboarding_document_uploads', 'onboarding_document_uploads', 'PQ',
 'Onboarding Management', 'Document Workflow', 'File Management', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}'),

-- UAT Tests for Business Scenarios
('uat', 'onboarding_business_scenario', 'Hospital Treatment Center UAT Test', 
 'Business acceptance test for hospital-type treatment center onboarding', 
 'treatment_center_onboarding', 'treatment_center_onboarding', 'PQ',
 'Onboarding Management', 'Business Acceptance', 'Hospital Scenario', false,
 'pending', '{"compliance_level": "21_cfr_part_11", "validation_required": true}'),

('uat', 'onboarding_clinic_scenario', 'Outpatient Clinic UAT Test', 
 'Business acceptance test for clinic-type treatment center onboarding', 
 'treatment_center_onboarding', 'treatment_center_onboarding', 'PQ',
 'Onboarding Management', 'Business Acceptance', 'Clinic Scenario', false,
 'pending', '{"compliance_level": "21_cfr_part_11", "validation_required": true}'),

('uat', 'onboarding_pharmacy_scenario', 'Specialty Pharmacy UAT Test', 
 'Business acceptance test for pharmacy-type treatment center onboarding', 
 'treatment_center_onboarding', 'treatment_center_onboarding', 'PQ',
 'Onboarding Management', 'Business Acceptance', 'Pharmacy Scenario', false,
 'pending', '{"compliance_level": "21_cfr_part_11", "validation_required": true}'),

-- Performance Tests for Onboarding
('performance', 'onboarding_load_test', 'Onboarding System Load Test', 
 'Test system performance under concurrent onboarding applications', 
 'treatment_center_onboarding', 'treatment_center_onboarding', 'PQ',
 'Onboarding Management', 'Performance Testing', 'Load Testing', false,
 'pending', '{"compliance_level": "21_cfr_part_11", "validation_required": true}'),

('performance', 'onboarding_document_performance', 'Document Upload Performance Test', 
 'Test document upload performance and concurrent file processing', 
 'onboarding_document_uploads', 'onboarding_document_uploads', 'PQ',
 'Onboarding Management', 'Performance Testing', 'File Performance', false,
 'pending', '{"compliance_level": "21_cfr_part_11", "validation_required": true}'),

('performance', 'onboarding_database_performance', 'Onboarding Database Performance Test', 
 'Test database performance for complex onboarding queries', 
 'treatment_center_onboarding', 'multiple_tables', 'PQ',
 'Onboarding Management', 'Performance Testing', 'Database Performance', false,
 'pending', '{"compliance_level": "21_cfr_part_11", "validation_required": true}'),

-- Security Tests for Onboarding
('security', 'onboarding_access_control', 'Onboarding Access Control Security Test', 
 'Test role-based access control for onboarding data', 
 'treatment_center_onboarding', 'treatment_center_onboarding', 'PQ',
 'Onboarding Management', 'Security Testing', 'Access Control', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}'),

('security', 'onboarding_data_protection', 'Onboarding Data Protection Security Test', 
 'Test data encryption and protection for sensitive onboarding information', 
 'treatment_center_onboarding', 'treatment_center_onboarding', 'PQ',
 'Onboarding Management', 'Security Testing', 'Data Protection', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}'),

-- Regression Tests for Onboarding
('regression', 'onboarding_core_regression', 'Onboarding Core Features Regression Test', 
 'Regression test for core onboarding functionality after updates', 
 'treatment_center_onboarding', 'treatment_center_onboarding', 'PQ',
 'Onboarding Management', 'Regression Testing', 'Core Features', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}'),

('regression', 'onboarding_workflow_regression', 'Onboarding Workflow Regression Test', 
 'Regression test for onboarding workflow and step navigation', 
 'treatment_center_onboarding', 'treatment_center_onboarding', 'PQ',
 'Onboarding Management', 'Regression Testing', 'Workflow Testing', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}');

-- Update test execution metadata
UPDATE comprehensive_test_cases 
SET execution_data = jsonb_build_object(
  'test_environment', 'onboarding_specific',
  'data_category', 'treatment_center_onboarding',
  'business_context', 'healthcare_onboarding',
  'compliance_framework', '21_CFR_Part_11'
)
WHERE related_functionality LIKE '%onboard%' 
   OR related_functionality LIKE '%treatment_center%';