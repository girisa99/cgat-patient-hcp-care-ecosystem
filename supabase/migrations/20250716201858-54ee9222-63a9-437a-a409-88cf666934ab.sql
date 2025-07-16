-- Remove duplicate test cases keeping only the latest ones
DELETE FROM comprehensive_test_cases 
WHERE id NOT IN (
  SELECT id 
  FROM (
    SELECT DISTINCT ON (test_name, test_suite_type, test_category) 
           id, 
           test_name, 
           test_suite_type, 
           test_category, 
           created_at
    FROM comprehensive_test_cases 
    ORDER BY test_name, test_suite_type, test_category, created_at DESC
  ) AS unique_tests
);

-- Verify no duplicates remain and get actual counts
SELECT 
  'After cleanup' as status,
  COUNT(*) as total_count,
  COUNT(DISTINCT (test_name, test_suite_type, test_category)) as unique_tests,
  test_suite_type,
  COUNT(*) as count_by_type
FROM comprehensive_test_cases 
GROUP BY test_suite_type
ORDER BY count_by_type DESC;