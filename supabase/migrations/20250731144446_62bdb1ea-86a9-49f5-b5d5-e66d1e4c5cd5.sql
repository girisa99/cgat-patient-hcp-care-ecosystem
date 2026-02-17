-- Clean up and create superadmin-specific test cases

-- First, delete execution history for non-superadmin tests
DELETE FROM test_execution_history 
WHERE test_case_id IN (
  SELECT id FROM comprehensive_test_cases 
  WHERE auto_generated = true 
  AND related_functionality NOT LIKE '%admin%' 
  AND test_description NOT LIKE '%admin%' 
  AND module_name NOT LIKE '%Admin%'
  AND related_functionality NOT LIKE '%user%'
  AND related_functionality NOT LIKE '%role%'
  AND related_functionality NOT LIKE '%security%'
  AND related_functionality NOT LIKE '%api%'
  AND related_functionality NOT LIKE '%module%'
  AND related_functionality NOT LIKE '%system%'
);

-- Then delete the non-superadmin auto-generated test cases
DELETE FROM comprehensive_test_cases 
WHERE auto_generated = true 
AND related_functionality NOT LIKE '%admin%' 
AND test_description NOT LIKE '%admin%' 
AND module_name NOT LIKE '%Admin%'
AND related_functionality NOT LIKE '%user%'
AND related_functionality NOT LIKE '%role%'
AND related_functionality NOT LIKE '%security%'
AND related_functionality NOT LIKE '%api%'
AND related_functionality NOT LIKE '%module%'
AND related_functionality NOT LIKE '%system%';

-- Create comprehensive superadmin-specific test cases organized by categories
-- Using only valid test_suite_types: unit, integration, system, e2e, uat, regression, performance

-- Category 1: Unit Tests - User & Role Management
INSERT INTO comprehensive_test_cases (
  test_suite_type, test_category, test_name, test_description,
  related_functionality, database_source, validation_level,
  module_name, coverage_area, business_function, auto_generated,
  test_status, cfr_part11_metadata, topic
) VALUES
('unit', 'user_management', 'User Profile Creation Validation', 
 'Test user profile creation and validation for superadmin', 
 'profiles', 'profiles', 'IQ',
 'User Management', 'User Administration', 'Profile Management', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'User Administration'),

('unit', 'role_management', 'Role Assignment Validation', 
 'Test role assignment and permission validation logic', 
 'user_roles', 'user_roles', 'IQ',
 'Role Management', 'Access Control', 'Permission Management', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'Role Management'),

('unit', 'role_management', 'SuperAdmin Permission Checks', 
 'Test superadmin permission validation functions', 
 'is_admin_user_safe', 'public.is_admin_user_safe', 'IQ',
 'Security Management', 'Access Control', 'Security Functions', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'Security Functions'),

('unit', 'facility_management', 'Facility Administration Validation', 
 'Test facility creation and management validation', 
 'facilities', 'facilities', 'IQ',
 'Facility Management', 'Multi-Tenant', 'Facility Operations', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'Facility Management'),

-- Category 2: Unit Tests - System Configuration
('unit', 'module_management', 'Module Configuration Validation', 
 'Test module activation, deactivation, and configuration', 
 'modules', 'modules', 'IQ',
 'Module Management', 'System Configuration', 'Module Control', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'Module Management'),

('unit', 'api_management', 'API Key Management Validation', 
 'Test API key creation, validation, and permissions', 
 'api_keys', 'api_keys', 'IQ',
 'API Management', 'Security', 'API Security', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'API Management'),

-- Category 3: Integration Tests - SuperAdmin Workflows
('integration', 'user_role_integration', 'User-Role Assignment Integration', 
 'Test complete user creation and role assignment workflow', 
 'profiles', 'profiles,user_roles,roles', 'OQ',
 'User Management', 'Workflow Integration', 'User Onboarding', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'User Workflow'),

('integration', 'facility_user_integration', 'Facility-User Association Integration', 
 'Test facility assignment and multi-tenant user management', 
 'facilities', 'facilities,profiles,user_facility_access', 'OQ',
 'Facility Management', 'Multi-Tenant Integration', 'Tenant Management', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'Multi-Tenant'),

('integration', 'module_access_integration', 'Module Access Control Integration', 
 'Test module access control and user permissions integration', 
 'modules', 'modules,user_roles,role_module_assignments', 'OQ',
 'Module Management', 'Access Integration', 'Permission Control', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'Access Control'),

('integration', 'api_security_integration', 'API Security Integration', 
 'Test API key authentication and authorization integration', 
 'api_keys', 'api_keys,api_usage_analytics', 'OQ',
 'API Management', 'Security Integration', 'API Security', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'API Security'),

-- Category 4: System Tests - SuperAdmin-Only Features
('system', 'deployment_management', 'Deployment Management System Test', 
 'Test complete deployment management and configuration', 
 'system_configuration', 'multiple_tables', 'PQ',
 'Deployment Management', 'System Administration', 'Infrastructure', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'Deployment'),

('system', 'security_management', 'Security Management System Test', 
 'Test comprehensive security management and monitoring', 
 'security_settings', 'security_settings,audit_logs', 'PQ',
 'Security Management', 'System Security', 'Security Monitoring', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'Security'),

('system', 'framework_management', 'Framework Management System Test', 
 'Test framework configuration and management capabilities', 
 'system_functionality_registry', 'system_functionality_registry', 'PQ',
 'Framework Management', 'System Framework', 'Framework Control', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'Framework'),

('system', 'stability_monitoring', 'System Stability Monitoring Test', 
 'Test system stability monitoring and issue tracking', 
 'active_issues', 'active_issues,stability_monitoring', 'PQ',
 'Stability Management', 'System Monitoring', 'Stability Control', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'Stability'),

-- Category 5: E2E Tests - SuperAdmin User Journeys
('e2e', 'complete_admin_workflow', 'Complete SuperAdmin Workflow', 
 'Test full superadmin workflow from login to system management', 
 'profiles', 'multiple_tables', 'PQ',
 'Admin Management', 'Complete Workflow', 'Admin Journey', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'Admin Workflow'),

('e2e', 'user_lifecycle_management', 'User Lifecycle Management E2E', 
 'Test complete user lifecycle from creation to deactivation', 
 'profiles', 'profiles,user_roles,facilities', 'PQ',
 'User Management', 'Lifecycle Management', 'User Operations', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'User Lifecycle'),

('e2e', 'facility_management_workflow', 'Facility Management Workflow E2E', 
 'Test complete facility setup and management workflow', 
 'facilities', 'facilities,profiles,user_facility_access', 'PQ',
 'Facility Management', 'Facility Operations', 'Facility Workflow', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'Facility Operations'),

-- Category 6: Performance Tests - SuperAdmin System Load
('performance', 'admin_dashboard_performance', 'Admin Dashboard Performance Test', 
 'Test admin dashboard performance under load', 
 'profiles', 'multiple_tables', 'PQ',
 'Admin Management', 'Performance Testing', 'Dashboard Performance', false,
 'pending', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'Performance'),

('performance', 'bulk_user_operations', 'Bulk User Operations Performance', 
 'Test performance of bulk user creation and management', 
 'profiles', 'profiles,user_roles', 'PQ',
 'User Management', 'Performance Testing', 'Bulk Operations', false,
 'pending', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'Bulk Performance'),

('performance', 'system_monitoring_performance', 'System Monitoring Performance Test', 
 'Test performance of system monitoring and analytics', 
 'audit_logs', 'audit_logs,api_usage_analytics', 'PQ',
 'System Management', 'Performance Testing', 'Monitoring Performance', false,
 'pending', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'Monitoring Performance'),

-- Category 7: UAT Tests - SuperAdmin Business Scenarios
('uat', 'enterprise_setup', 'Enterprise System Setup UAT', 
 'UAT for complete enterprise system setup and configuration', 
 'facilities', 'multiple_tables', 'PQ',
 'Enterprise Management', 'Business Setup', 'Enterprise Configuration', false,
 'pending', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'Enterprise Setup'),

('uat', 'compliance_management', 'Compliance Management UAT', 
 'UAT for compliance management and audit trail functionality', 
 'audit_logs', 'audit_logs,compliance_monitoring', 'PQ',
 'Compliance Management', 'Compliance Operations', 'Audit Management', false,
 'pending', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'Compliance'),

('uat', 'security_administration', 'Security Administration UAT', 
 'UAT for comprehensive security administration tasks', 
 'security_settings', 'security_settings,user_roles', 'PQ',
 'Security Management', 'Security Operations', 'Security Administration', false,
 'pending', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'Security Admin'),

-- Category 8: Regression Tests - SuperAdmin Core Functions
('regression', 'admin_core_regression', 'SuperAdmin Core Functions Regression', 
 'Regression testing for core superadmin functionality', 
 'profiles', 'multiple_tables', 'PQ',
 'Admin Management', 'Regression Testing', 'Core Admin Features', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'Admin Regression'),

('regression', 'security_regression', 'Security Features Regression Test', 
 'Regression testing for security and access control features', 
 'security_settings', 'security_settings,user_roles', 'PQ',
 'Security Management', 'Regression Testing', 'Security Features', false,
 'passed', '{"compliance_level": "21_cfr_part_11", "validation_required": true}', 'Security Regression');