-- Clean up and create specific test cases for onboarding treatment centers
-- This migration handles foreign key constraints properly

-- First, delete any related test execution history to avoid foreign key violations
DELETE FROM test_execution_history 
WHERE test_case_id IN (
  SELECT id FROM test_cases 
  WHERE category = 'onboarding' 
  AND name LIKE '%Auto-generated%'
);

-- Now safely delete the generic auto-generated test cases
DELETE FROM test_cases 
WHERE category = 'onboarding' 
AND name LIKE '%Auto-generated%';

-- Insert comprehensive test cases for onboarding treatment centers
INSERT INTO test_cases (name, description, category, test_type, priority, expected_result, test_steps, tags, estimated_duration_minutes) VALUES

-- Unit Tests
('User Role Validation', 'Verify user role assignment during onboarding', 'onboarding', 'unit', 'high', 'User gets correct role based on selection', '[{"step": "Create user profile", "action": "Select treatment center role", "expected": "Role assigned correctly"}]', '["role-management", "validation"]', 5),

('Email Verification Flow', 'Test email verification process', 'onboarding', 'unit', 'high', 'Email verification link sent and validated', '[{"step": "Enter email", "action": "Submit form", "expected": "Verification email sent"}]', '["email", "verification"]', 10),

('Password Strength Validation', 'Validate password requirements', 'onboarding', 'unit', 'medium', 'Password meets security requirements', '[{"step": "Enter password", "action": "Validate strength", "expected": "Password accepted or rejected based on criteria"}]', '["security", "password"]', 3),

-- Integration Tests
('Treatment Center Registration API', 'Test complete treatment center registration flow', 'onboarding', 'integration', 'high', 'Treatment center successfully registered with all required data', '[{"step": "Submit registration form", "action": "API call to create facility", "expected": "Facility created in database"}]', '["api", "registration", "facility"]', 15),

('User Profile Creation with Facility Link', 'Test user profile creation linked to treatment center', 'onboarding', 'integration', 'high', 'User profile created and linked to correct facility', '[{"step": "Complete onboarding", "action": "Create profile with facility reference", "expected": "Profile linked to facility"}]', '["profile", "facility-link"]', 12),

('Document Upload Integration', 'Test document upload during onboarding', 'onboarding', 'integration', 'medium', 'Documents uploaded and stored securely', '[{"step": "Upload license documents", "action": "File upload API", "expected": "Files stored in secure bucket"}]', '["documents", "upload", "security"]', 20),

-- System Tests
('Complete Onboarding Workflow', 'End-to-end onboarding process for treatment centers', 'onboarding', 'system', 'critical', 'Treatment center fully onboarded and operational', '[{"step": "Start onboarding", "action": "Complete all steps", "expected": "Facility ready for operations"}]', '["e2e", "workflow", "complete"]', 45),

('Multi-User Onboarding', 'Test multiple users onboarding to same treatment center', 'onboarding', 'system', 'high', 'Multiple users successfully onboarded with correct permissions', '[{"step": "Onboard primary admin", "action": "Onboard secondary users", "expected": "All users have appropriate access"}]', '["multi-user", "permissions"]', 30),

-- E2E Tests
('Treatment Center Admin Journey', 'Complete admin user journey from signup to dashboard', 'onboarding', 'e2e', 'critical', 'Admin can access all treatment center features', '[{"step": "Sign up as admin", "action": "Complete onboarding", "expected": "Access to admin dashboard"}]', '["admin", "journey", "dashboard"]', 60),

('Patient Registration by Treatment Center', 'Test patient registration flow by treatment center staff', 'onboarding', 'e2e', 'high', 'Treatment center can register patients successfully', '[{"step": "Login as staff", "action": "Register new patient", "expected": "Patient added to system"}]', '["patient", "registration", "staff"]', 25),

-- User Acceptance Tests
('Treatment Center Director Onboarding', 'UAT for treatment center director role', 'onboarding', 'uat', 'high', 'Director can manage treatment center operations', '[{"step": "Complete director onboarding", "action": "Access management features", "expected": "All director functions available"}]', '["director", "management", "uat"]', 40),

('Clinical Staff Onboarding', 'UAT for clinical staff members', 'onboarding', 'uat', 'high', 'Clinical staff can access patient records and treatment plans', '[{"step": "Complete staff onboarding", "action": "Access clinical features", "expected": "Clinical tools accessible"}]', '["clinical", "staff", "records"]', 35),

-- Performance Tests
('Concurrent Onboarding Load', 'Test system performance under multiple concurrent onboardings', 'onboarding', 'performance', 'medium', 'System handles 50+ concurrent onboardings without degradation', '[{"step": "Simulate 50 users", "action": "Start onboarding simultaneously", "expected": "Response time < 3 seconds"}]', '["load", "concurrent", "performance"]', 30),

('Large Document Upload Performance', 'Test performance of large file uploads during onboarding', 'onboarding', 'performance', 'medium', 'Large files upload within acceptable timeframe', '[{"step": "Upload 10MB+ files", "action": "Monitor upload time", "expected": "Upload completes within 2 minutes"}]', '["upload", "large-files", "performance"]', 15),

-- Security Tests
('Onboarding Data Encryption', 'Verify sensitive data encryption during onboarding', 'onboarding', 'security', 'critical', 'All sensitive data encrypted in transit and at rest', '[{"step": "Submit sensitive data", "action": "Verify encryption", "expected": "Data encrypted properly"}]', '["encryption", "sensitive-data", "security"]', 20),

('Access Control Validation', 'Test access controls during onboarding process', 'onboarding', 'security', 'high', 'Users can only access appropriate onboarding steps', '[{"step": "Attempt unauthorized access", "action": "Verify blocking", "expected": "Access denied appropriately"}]', '["access-control", "authorization", "security"]', 25),

('SQL Injection Prevention', 'Test onboarding forms against SQL injection', 'onboarding', 'security', 'high', 'System prevents SQL injection attacks', '[{"step": "Submit malicious SQL", "action": "Verify rejection", "expected": "Input sanitized/rejected"}]', '["sql-injection", "input-validation", "security"]', 15),

-- Regression Tests
('Previous Version Compatibility', 'Ensure new onboarding changes don''t break existing flows', 'onboarding', 'regression', 'high', 'Existing onboarded users retain full functionality', '[{"step": "Test existing user", "action": "Verify all features", "expected": "No functionality lost"}]', '["compatibility", "existing-users", "regression"]', 35),

('Database Migration Validation', 'Verify database changes don''t affect existing data', 'onboarding', 'regression', 'critical', 'All existing treatment center data intact after migration', '[{"step": "Run migration", "action": "Verify data integrity", "expected": "No data loss or corruption"}]', '["migration", "data-integrity", "regression"]', 20);