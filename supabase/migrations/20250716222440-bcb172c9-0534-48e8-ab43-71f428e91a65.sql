-- Fix the constraint issue and add 'comprehensive' as valid status
ALTER TABLE system_functionality_registry 
DROP CONSTRAINT IF EXISTS system_functionality_registry_test_coverage_status_check;

ALTER TABLE system_functionality_registry 
ADD CONSTRAINT system_functionality_registry_test_coverage_status_check 
CHECK (test_coverage_status IN ('uncovered', 'partial', 'covered', 'comprehensive'));

-- Generate sample comprehensive documentation
SELECT public.generate_comprehensive_documentation(
  NULL,  -- all functionality
  true,  -- include architecture
  true,  -- include requirements  
  true   -- include test cases
) as sample_documentation;