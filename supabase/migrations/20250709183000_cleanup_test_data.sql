-- Cleanup migration – remove mock/test records
-- Created: 2025-07-09

-- Example criteria (adjust as needed in Supabase Studio before applying to prod):
--   • Emails ending in @example.com
--   • Dummy facilities named 'Test Facility'
--   • API services with base_url LIKE '/mock%'
--   • Modules marked is_active = false AND created before 2025-01-01

-- 1. Remove mock users
DELETE FROM profiles WHERE email ILIKE '%@example.com';

-- 2. Remove test facilities
DELETE FROM facilities WHERE name ILIKE 'Test Facility%';

-- 3. Remove mock API services
DELETE FROM api_integration_registry WHERE base_url LIKE '/mock%';

-- 4. Remove deprecated/inactive modules
DELETE FROM modules
WHERE is_active = false
  AND created_at < '2025-01-01';

-- 5. (Optional) Vacuum tables to reclaim space (Postgres auto-vacuums, but explicit VACUUM can help)
-- VACUUM ANALYZE profiles;
-- VACUUM ANALYZE facilities;
-- VACUUM ANALYZE api_integration_registry;
-- VACUUM ANALYZE modules;