-- Update test cases with detailed test steps and expected results

-- Update E2E test cases with comprehensive test scripts
UPDATE comprehensive_test_cases 
SET 
    test_steps = jsonb_build_array(
        jsonb_build_object(
            'step', 1, 
            'action', 'User Authentication',
            'description', 'Verify user can log in with valid credentials',
            'expected', 'Successful login and redirection to dashboard'
        ),
        jsonb_build_object(
            'step', 2,
            'action', 'Navigation Test', 
            'description', 'Navigate to ' || COALESCE(module_name, 'target module'),
            'expected', 'Module loads successfully with proper access controls'
        ),
        jsonb_build_object(
            'step', 3,
            'action', 'CRUD Operations',
            'description', 'Perform Create, Read, Update, Delete operations on ' || related_functionality,
            'expected', 'All operations complete successfully with proper validation'
        ),
        jsonb_build_object(
            'step', 4,
            'action', 'Data Validation',
            'description', 'Verify data integrity and business rules',
            'expected', 'Data persists correctly with audit trail'
        ),
        jsonb_build_object(
            'step', 5,
            'action', 'Logout Test',
            'description', 'User logout and session cleanup',
            'expected', 'Clean logout with session termination'
        )
    ),
    expected_results = 'Complete end-to-end workflow validation for ' || test_name || '. All user interactions should function properly with proper access controls, data validation, and audit trails. System should maintain 21 CFR Part 11 compliance throughout the workflow.',
    test_description = 'Comprehensive end-to-end test validating the complete user workflow for ' || COALESCE(related_functionality, 'system functionality') || ' including authentication, navigation, CRUD operations, data validation, and proper cleanup.'
WHERE test_suite_type = 'e2e';

-- Update System test cases with performance and reliability scripts  
UPDATE comprehensive_test_cases 
SET 
    test_steps = jsonb_build_array(
        jsonb_build_object(
            'step', 1,
            'action', 'System Load Test',
            'description', 'Test system performance under normal load conditions',
            'expected', 'Response time < 3 seconds, CPU usage < 70%'
        ),
        jsonb_build_object(
            'step', 2,
            'action', 'Concurrent User Test',
            'description', 'Simulate multiple concurrent users accessing ' || related_functionality,
            'expected', 'System handles concurrent access without degradation'
        ),
        jsonb_build_object(
            'step', 3,
            'action', 'Data Integrity Test',
            'description', 'Verify data consistency under system stress',
            'expected', 'No data corruption or loss during high load'
        ),
        jsonb_build_object(
            'step', 4,
            'action', 'Memory Usage Test',
            'description', 'Monitor memory consumption during operations',
            'expected', 'Memory usage remains within acceptable limits'
        ),
        jsonb_build_object(
            'step', 5,
            'action', 'Error Recovery Test',
            'description', 'Test system recovery from failures',
            'expected', 'Graceful error handling and system recovery'
        )
    ),
    expected_results = 'System-level validation for ' || test_name || ' demonstrating performance, reliability, and scalability. System should handle concurrent users, maintain data integrity, and recover gracefully from errors while meeting performance benchmarks.',
    test_description = 'System-level test validating performance, reliability, and scalability of ' || COALESCE(related_functionality, 'system component') || ' under various load conditions and stress scenarios.'
WHERE test_suite_type = 'system';

-- Update UAT test cases with business validation scripts
UPDATE comprehensive_test_cases 
SET 
    test_steps = jsonb_build_array(
        jsonb_build_object(
            'step', 1,
            'action', 'Business Scenario Setup',
            'description', 'Configure realistic business scenario for ' || related_functionality,
            'expected', 'Test environment reflects real business conditions'
        ),
        jsonb_build_object(
            'step', 2,
            'action', 'User Workflow Execution',
            'description', 'Execute typical business workflow using ' || COALESCE(module_name, 'system module'),
            'expected', 'Workflow completes naturally and intuitively'
        ),
        jsonb_build_object(
            'step', 3,
            'action', 'Business Rule Validation',
            'description', 'Verify business rules and constraints are enforced',
            'expected', 'All business requirements are met correctly'
        ),
        jsonb_build_object(
            'step', 4,
            'action', 'Reporting and Analytics',
            'description', 'Generate reports and validate data analytics',
            'expected', 'Reports are accurate and provide business value'
        ),
        jsonb_build_object(
            'step', 5,
            'action', 'User Acceptance Criteria',
            'description', 'Validate against documented acceptance criteria',
            'expected', 'All acceptance criteria are satisfied'
        )
    ),
    expected_results = 'User acceptance validation for ' || test_name || ' confirming that business requirements are met and the system provides expected business value. Users should be able to complete real-world tasks efficiently and effectively.',
    test_description = 'User acceptance test validating that ' || COALESCE(related_functionality, 'system functionality') || ' meets business requirements and provides expected user experience in real-world scenarios.'
WHERE test_suite_type = 'uat';

-- Update Regression test cases with stability validation scripts
UPDATE comprehensive_test_cases 
SET 
    test_steps = jsonb_build_array(
        jsonb_build_object(
            'step', 1,
            'action', 'Baseline Validation',
            'description', 'Verify existing functionality remains unchanged',
            'expected', 'All baseline tests pass without regression'
        ),
        jsonb_build_object(
            'step', 2,
            'action', 'Integration Point Testing',
            'description', 'Test integration points with ' || related_functionality,
            'expected', 'All integrations function as before changes'
        ),
        jsonb_build_object(
            'step', 3,
            'action', 'Data Migration Validation',
            'description', 'Verify data integrity after changes',
            'expected', 'No data loss or corruption detected'
        ),
        jsonb_build_object(
            'step', 4,
            'action', 'Performance Regression Test',
            'description', 'Ensure performance has not degraded',
            'expected', 'Performance metrics meet or exceed baseline'
        ),
        jsonb_build_object(
            'step', 5,
            'action', 'Compliance Verification',
            'description', 'Verify regulatory compliance is maintained',
            'expected', 'All compliance requirements continue to be met'
        )
    ),
    expected_results = 'Regression validation for ' || test_name || ' ensuring that changes have not negatively impacted existing functionality. All previously working features should continue to function properly with maintained performance and compliance.',
    test_description = 'Regression test ensuring that changes to the system have not negatively impacted ' || COALESCE(related_functionality, 'existing functionality') || ' and that all previously working features continue to operate correctly.'
WHERE test_suite_type = 'regression';

-- Return summary of updates
SELECT 
    test_suite_type,
    COUNT(*) as tests_updated,
    COUNT(*) FILTER (WHERE test_steps IS NOT NULL AND jsonb_array_length(test_steps) > 0) as tests_with_steps,
    COUNT(*) FILTER (WHERE expected_results IS NOT NULL AND length(expected_results) > 0) as tests_with_expected_results
FROM comprehensive_test_cases 
WHERE test_suite_type IN ('e2e', 'system', 'uat', 'regression')
GROUP BY test_suite_type
ORDER BY test_suite_type;